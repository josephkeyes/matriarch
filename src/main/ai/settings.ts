/**
 * AI Settings Service
 * 
 * Manages system-level AI configuration including default provider and model.
 * Settings are persisted to the database.
 */

import { DatabaseClient } from '../database/DatabaseClient'

export interface AISettings {
    /** Default AI provider: 'ollama', 'openai', 'anthropic', etc. */
    defaultProvider: string
    /** Default model ID within the provider */
    defaultModel: string
    /** Optional: Base URL for self-hosted providers like Ollama */
    providerBaseUrl?: string
}

const DEFAULT_SETTINGS: AISettings = {
    defaultProvider: 'ollama',
    defaultModel: 'llama3.2',
    providerBaseUrl: 'http://localhost:11434',
}

const SETTINGS_KEY = 'ai_settings'

/**
 * Get current AI settings, falling back to defaults if not set.
 */
export async function getAISettings(): Promise<AISettings> {
    try {
        const db = DatabaseClient.getInstance().getClient()
        const record = await db.systemSettings.findUnique({
            where: { key: SETTINGS_KEY }
        })

        if (record?.value) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(record.value) }
        }
    } catch (error) {
        console.warn('Failed to load AI settings, using defaults:', error)
    }

    return DEFAULT_SETTINGS
}

/**
 * Update AI settings. Partial updates are merged with existing settings.
 */
export async function updateAISettings(settings: Partial<AISettings>): Promise<void> {
    const db = DatabaseClient.getInstance().getClient()
    const current = await getAISettings()
    const updated = { ...current, ...settings }

    await db.systemSettings.upsert({
        where: { key: SETTINGS_KEY },
        create: {
            key: SETTINGS_KEY,
            value: JSON.stringify(updated),
        },
        update: {
            value: JSON.stringify(updated),
        },
    })
}

/**
 * Reset AI settings to defaults.
 */
export async function resetAISettings(): Promise<void> {
    const db = DatabaseClient.getInstance().getClient()
    await db.systemSettings.delete({
        where: { key: SETTINGS_KEY }
    }).catch(() => { /* ignore if doesn't exist */ })
}
