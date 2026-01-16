/**
 * Settings Service
 * 
 * Central service for all settings operations. Provides typed getters/setters
 * for each settings category with automatic defaults fallback.
 */

import { DatabaseClient } from '../database/DatabaseClient'
import {
    GeneralSettings,
    AISettings,
    GENERAL_DEFAULTS,
    AI_DEFAULTS,
    SETTINGS_KEYS,
    SettingsCategory,
    CURRENT_SCHEMA_VERSION,
} from './defaults'
import * as SecureStorage from './SecureStorage'

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get a single setting value from the database, with default fallback.
 */
async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const prisma = DatabaseClient.getInstance().getClient()

    const setting = await prisma.systemSettings.findUnique({
        where: { key }
    })

    if (!setting) {
        return defaultValue
    }

    // Parse value based on expected type
    const value = setting.value

    if (typeof defaultValue === 'boolean') {
        return (value === 'true') as unknown as T
    }
    if (typeof defaultValue === 'number') {
        return Number(value) as unknown as T
    }
    return value as unknown as T
}

/**
 * Set a single setting value in the database.
 */
async function setSetting(key: string, value: unknown): Promise<void> {
    const prisma = DatabaseClient.getInstance().getClient()

    const stringValue = String(value)

    await prisma.systemSettings.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
    })
}

/**
 * Delete a setting from the database.
 */
async function deleteSetting(key: string): Promise<void> {
    const prisma = DatabaseClient.getInstance().getClient()

    await prisma.systemSettings.deleteMany({
        where: { key }
    })
}

// ============================================================================
// General Settings
// ============================================================================

/**
 * Get all general settings.
 */
export async function getGeneralSettings(): Promise<GeneralSettings> {
    const [theme, language, startMinimized] = await Promise.all([
        getSetting(SETTINGS_KEYS.GENERAL_THEME, GENERAL_DEFAULTS.theme),
        getSetting(SETTINGS_KEYS.GENERAL_LANGUAGE, GENERAL_DEFAULTS.language),
        getSetting(SETTINGS_KEYS.GENERAL_START_MINIMIZED, GENERAL_DEFAULTS.startMinimized),
    ])

    return {
        theme: theme as GeneralSettings['theme'],
        language,
        startMinimized,
    }
}

/**
 * Update general settings (partial updates allowed).
 */
export async function updateGeneralSettings(updates: Partial<GeneralSettings>): Promise<void> {
    const operations: Promise<void>[] = []

    if (updates.theme !== undefined) {
        operations.push(setSetting(SETTINGS_KEYS.GENERAL_THEME, updates.theme))
    }
    if (updates.language !== undefined) {
        operations.push(setSetting(SETTINGS_KEYS.GENERAL_LANGUAGE, updates.language))
    }
    if (updates.startMinimized !== undefined) {
        operations.push(setSetting(SETTINGS_KEYS.GENERAL_START_MINIMIZED, updates.startMinimized))
    }

    await Promise.all(operations)
}

// ============================================================================
// AI Settings
// ============================================================================

/**
 * Get all AI settings.
 */
export async function getAISettings(): Promise<AISettings> {
    const [
        defaultProvider,
        defaultModel,
        providerBaseUrl,
        maxTokens,
        temperature,
        autoNoteSummary,
        backgroundMapping,
    ] = await Promise.all([
        getSetting(SETTINGS_KEYS.AI_DEFAULT_PROVIDER, AI_DEFAULTS.defaultProvider),
        getSetting(SETTINGS_KEYS.AI_DEFAULT_MODEL, AI_DEFAULTS.defaultModel),
        getSetting(SETTINGS_KEYS.AI_PROVIDER_BASE_URL, AI_DEFAULTS.providerBaseUrl ?? ''),
        getSetting(SETTINGS_KEYS.AI_MAX_TOKENS, AI_DEFAULTS.maxTokens),
        getSetting(SETTINGS_KEYS.AI_TEMPERATURE, AI_DEFAULTS.temperature),
        getSetting(SETTINGS_KEYS.AI_AUTO_NOTE_SUMMARY, AI_DEFAULTS.autoNoteSummary),
        getSetting(SETTINGS_KEYS.AI_BACKGROUND_MAPPING, AI_DEFAULTS.backgroundMapping),
    ])

    return {
        defaultProvider,
        defaultModel,
        providerBaseUrl: providerBaseUrl || undefined,
        maxTokens,
        temperature,
        autoNoteSummary,
        backgroundMapping,
    }
}

/**
 * Update AI settings (partial updates allowed).
 */
export async function updateAISettings(updates: Partial<AISettings>): Promise<void> {
    const operations: Promise<void>[] = []

    if (updates.defaultProvider !== undefined) {
        operations.push(setSetting(SETTINGS_KEYS.AI_DEFAULT_PROVIDER, updates.defaultProvider))
    }
    if (updates.defaultModel !== undefined) {
        operations.push(setSetting(SETTINGS_KEYS.AI_DEFAULT_MODEL, updates.defaultModel))
    }
    if (updates.providerBaseUrl !== undefined) {
        operations.push(setSetting(SETTINGS_KEYS.AI_PROVIDER_BASE_URL, updates.providerBaseUrl))
    }
    if (updates.maxTokens !== undefined) {
        operations.push(setSetting(SETTINGS_KEYS.AI_MAX_TOKENS, updates.maxTokens))
    }
    if (updates.temperature !== undefined) {
        operations.push(setSetting(SETTINGS_KEYS.AI_TEMPERATURE, updates.temperature))
    }
    if (updates.autoNoteSummary !== undefined) {
        operations.push(setSetting(SETTINGS_KEYS.AI_AUTO_NOTE_SUMMARY, updates.autoNoteSummary))
    }
    if (updates.backgroundMapping !== undefined) {
        operations.push(setSetting(SETTINGS_KEYS.AI_BACKGROUND_MAPPING, updates.backgroundMapping))
    }

    await Promise.all(operations)
}

// ============================================================================
// Reset to Defaults
// ============================================================================

/**
 * Reset settings to their default values.
 * If category is specified, only resets that category.
 */
export async function resetToDefaults(category?: SettingsCategory): Promise<void> {
    if (!category || category === SettingsCategory.GENERAL) {
        await updateGeneralSettings(GENERAL_DEFAULTS)
    }
    if (!category || category === SettingsCategory.AI) {
        await updateAISettings(AI_DEFAULTS)
    }
}

// ============================================================================
// Secure Settings (API Keys, Tokens)
// ============================================================================

export { SecureStorage }

// ============================================================================
// Schema Migration
// ============================================================================

/**
 * Get the current schema version from the database.
 */
export async function getSchemaVersion(): Promise<number> {
    return getSetting(SETTINGS_KEYS.SCHEMA_VERSION, 0)
}

/**
 * Run any pending migrations.
 */
export async function runMigrations(): Promise<void> {
    const currentVersion = await getSchemaVersion()

    if (currentVersion >= CURRENT_SCHEMA_VERSION) {
        return // Already up to date
    }

    // Define migrations as functions
    const migrations: Array<() => Promise<void>> = [
        // Migration 0 -> 1: Initial schema
        async () => {
            // Seed default values if this is a fresh install
            await setSetting(SETTINGS_KEYS.SCHEMA_VERSION, 1)
            console.log('[Settings] Migrated to schema version 1')
        },
        // Future migrations would go here:
        // async () => { /* migration 1 -> 2 */ },
    ]

    // Run migrations sequentially
    for (let i = currentVersion; i < CURRENT_SCHEMA_VERSION; i++) {
        if (migrations[i]) {
            await migrations[i]()
        }
    }
}
