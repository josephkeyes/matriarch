/**
 * IPC Channel Constants
 * Centralized channel names to prevent typos and enable type-safe IPC.
 */

export const CHANNELS = {
    SYSTEM: {
        HEALTH: 'system:health',
    },
    SETTINGS: {
        GET_AI: 'settings:get-ai',
        UPDATE_AI: 'settings:update-ai',
    },
    AGENTS: {
        LIST: 'agents:list',
        EXECUTE: 'agents:execute',
        GET_LOGS: 'agents:get-logs',
    },
    // Future channels:
    // NOTES: { CREATE: 'notes:create', ... }
    // TASKS: { CREATE: 'tasks:create', ... }
} as const

export type Channel = typeof CHANNELS
