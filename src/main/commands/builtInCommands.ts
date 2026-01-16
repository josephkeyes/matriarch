/**
 * Built-in Command Definitions
 * 
 * Default commands that ship with the application.
 * These are seeded into the database on first run.
 */

import type { CreateCommandInput } from './types'

export interface BuiltInCommand extends CreateCommandInput {
    id: string
    isBuiltIn: true
    defaultHotkey?: string
    defaultIsGlobal?: boolean
}

export const BUILT_IN_COMMANDS: BuiltInCommand[] = [
    // =========================================================================
    // Navigation Commands
    // =========================================================================
    {
        id: 'nav.dashboard',
        name: 'Go to Dashboard',
        description: 'Navigate to the main dashboard view',
        type: 'navigation',
        actionType: 'navigate',
        actionPayload: { route: 'dashboard' },
        category: 'Navigation',
        source: 'system',
        isBuiltIn: true,
        defaultHotkey: 'CommandOrControl+Shift+D',
        defaultIsGlobal: false,
    },
    {
        id: 'nav.settings',
        name: 'Open Settings',
        description: 'Open the application settings',
        type: 'navigation',
        actionType: 'navigate',
        actionPayload: { route: 'settings' },
        category: 'Navigation',
        source: 'system',
        isBuiltIn: true,
        defaultHotkey: 'CommandOrControl+,',
        defaultIsGlobal: false,
    },

    // =========================================================================
    // Application Commands
    // =========================================================================
    {
        id: 'app.command-palette',
        name: 'Open Command Palette',
        description: 'Open the command palette to search and execute commands',
        type: 'application',
        actionType: 'execute',
        actionPayload: { params: { action: 'open-palette' } },
        category: 'Application',
        source: 'system',
        isBuiltIn: true,
        defaultHotkey: 'CommandOrControl+Shift+P',
        defaultIsGlobal: true,
    },
    {
        id: 'app.toggle-theme',
        name: 'Toggle Theme',
        description: 'Switch between light and dark theme',
        type: 'application',
        actionType: 'toggle',
        actionPayload: { params: { action: 'toggle-theme' } },
        category: 'Application',
        source: 'system',
        isBuiltIn: true,
    },
    {
        id: 'app.toggle-left-sidebar',
        name: 'Toggle Left Sidebar',
        description: 'Show or hide the left sidebar',
        type: 'application',
        actionType: 'toggle',
        actionPayload: { params: { action: 'toggle-left-sidebar' } },
        category: 'Application',
        source: 'system',
        isBuiltIn: true,
        defaultHotkey: 'CommandOrControl+\\',
        defaultIsGlobal: false,
    },
    {
        id: 'app.toggle-right-sidebar',
        name: 'Toggle Right Sidebar',
        description: 'Show or hide the right sidebar',
        type: 'application',
        actionType: 'toggle',
        actionPayload: { params: { action: 'toggle-right-sidebar' } },
        category: 'Application',
        source: 'system',
        isBuiltIn: true,
        defaultHotkey: 'CommandOrControl+Shift+\\',
        defaultIsGlobal: false,
    },

    // =========================================================================
    // CRUD Commands
    // =========================================================================
    {
        id: 'crud.new-collection',
        name: 'Create New Collection',
        description: 'Create a new collection to organize notes',
        type: 'crud',
        actionType: 'execute',
        actionPayload: { params: { action: 'create-collection' } },
        category: 'Collections',
        source: 'system',
        isBuiltIn: true,
        defaultHotkey: 'CommandOrControl+Shift+C',
        defaultIsGlobal: false,
    },
    {
        id: 'crud.new-note',
        name: 'Create New Note',
        description: 'Create a new note',
        type: 'crud',
        actionType: 'execute',
        actionPayload: { params: { action: 'create-note' } },
        category: 'Notes',
        source: 'system',
        isBuiltIn: true,
        defaultHotkey: 'CommandOrControl+N',
        defaultIsGlobal: false,
    },
]
