/**
 * IPC Channel Constants
 * Centralized channel names to prevent typos and enable type-safe IPC.
 */

export const CHANNELS = {
    SYSTEM: {
        HEALTH: 'system:health',
    },
    SETTINGS: {
        GET_GENERAL: 'settings:get-general',
        UPDATE_GENERAL: 'settings:update-general',
        GET_AI: 'settings:get-ai',
        UPDATE_AI: 'settings:update-ai',
        RESET_DEFAULTS: 'settings:reset-defaults',
    },
    AGENTS: {
        LIST: 'agents:list',
        EXECUTE: 'agents:execute',
        GET_LOGS: 'agents:get-logs',
    },
    COLLECTIONS: {
        LIST: 'collections:list',
        CREATE: 'collections:create',
        UPDATE: 'collections:update',
        DELETE: 'collections:delete',
    },
    NOTES: {
        CREATE: 'notes:create',
        READ: 'notes:read',
        UPDATE: 'notes:update',
        DELETE: 'notes:delete',
    },
    AI_PROVIDERS: {
        LIST: 'ai-providers:list',
        GET_CONFIG: 'ai-providers:get-config',
        SET_ENABLED: 'ai-providers:set-enabled',
        UPDATE_CONFIG: 'ai-providers:update-config',
        CHECK_AVAILABILITY: 'ai-providers:check-availability',
        GET_MODELS: 'ai-providers:get-models',
    },
    COMMANDS: {
        LIST: 'commands:list',
        GET: 'commands:get',
        CREATE: 'commands:create',
        UPDATE: 'commands:update',
        DELETE: 'commands:delete',
        EXECUTE: 'commands:execute',
        ADD_HOTKEY: 'commands:add-hotkey',
        REMOVE_HOTKEY: 'commands:remove-hotkey',
        UPDATE_HOTKEY: 'commands:update-hotkey',
    },
    // Future channels:
    // TASKS: { CREATE: 'tasks:create', ... }
} as const

export type Channel = typeof CHANNELS
