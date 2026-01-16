/**
 * Settings Module
 * 
 * Re-exports all settings-related functionality.
 */

// Types and defaults
export {
    SettingsCategory,
    GENERAL_DEFAULTS,
    AI_DEFAULTS,
    SETTINGS_KEYS,
    CURRENT_SCHEMA_VERSION,
} from './defaults'

export type { GeneralSettings, AISettings } from './defaults'

// Service functions
export {
    getGeneralSettings,
    updateGeneralSettings,
    getAISettings,
    updateAISettings,
    resetToDefaults,
    getSchemaVersion,
    runMigrations,
    SecureStorage,
} from './SettingsService'
