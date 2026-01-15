
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { listCollections, createCollection } from './collectionsApi'
import { DatabaseClient } from '../database/DatabaseClient'
import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// Mock Electron
vi.mock('electron', () => ({
    app: { getPath: vi.fn() },
    ipcMain: { handle: vi.fn() }
}))

describe('Collections API', () => {
    let tempDir: string

    beforeEach(async () => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'matriarch-test-api-'))
        vi.mocked(app.getPath).mockReturnValue(tempDir)
        // @ts-ignore
        DatabaseClient.instance = undefined
        await DatabaseClient.getInstance().initialize()
    })

    afterEach(() => {
        try { fs.rmSync(tempDir, { recursive: true, force: true }) } catch { }
    })

    it('should create and list collections', async () => {
        // Create
        const created = await createCollection('Test Collection')
        expect(created.name).toBe('Test Collection')
        expect(created.id).toBeDefined()

        // List
        const list = await listCollections()
        expect(list).toHaveLength(1)
        expect(list[0].name).toBe('Test Collection')
        expect(list[0].folders).toBeDefined()
    })
})
