import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseClient } from './database/DatabaseClient'
import { AgentOrchestrator } from './agents/AgentOrchestrator'
import { CommandRegistry, HotkeyManager } from './commands'
import { registerAllHandlers } from './api'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─ dist
// │ ├─ index.html
// │ ├── main
// │ │   └── index.js
// │ └── preload
// │     └── index.js
// ├─┬─ dist-electron
// │ ├── main
// │ │   └── index.js
// │ └── preload
// │     └── index.js

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

async function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
        },
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// Clean up global shortcuts when app quits
app.on('will-quit', () => {
    HotkeyManager.getInstance().unregisterAll()
})

app.whenReady().then(async () => {
    console.log('App ready, initializing systems...')

    // Register IPC API handlers first (before any windows are created)
    registerAllHandlers()
    try {
        const db = DatabaseClient.getInstance()
        await db.initialize()
        console.log('Database initialized successfully')
    } catch (error) {
        console.error('Failed to initialize database:', error)
    }

    // Initialize Agent Orchestrator
    try {
        const orchestrator = AgentOrchestrator.getInstance()
        console.log('Agent Orchestrator initialized')
    } catch (error) {
        console.error('Failed to initialize orchestrator:', error)
    }

    // Initialize Command Registry (seeds built-in commands)
    try {
        const commandRegistry = CommandRegistry.getInstance()
        await commandRegistry.initialize()
        console.log('Command Registry initialized')
    } catch (error) {
        console.error('Failed to initialize command registry:', error)
    }

    // Initialize Hotkey Manager (registers global shortcuts)
    try {
        const hotkeyManager = HotkeyManager.getInstance()
        await hotkeyManager.initialize()
        console.log('Hotkey Manager initialized')
    } catch (error) {
        console.error('Failed to initialize hotkey manager:', error)
    }

    createWindow()
})
