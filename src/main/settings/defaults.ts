/**
 * Settings Types & Defaults
 * 
 * Defines the shape and default values for all system settings.
 * These defaults are used when no value exists in the database.
 */

// ============================================================================
// Settings Categories
// ============================================================================

export enum SettingsCategory {
    GENERAL = 'general',
    AI = 'ai',
}

// ============================================================================
// Settings Types
// ============================================================================

export interface GeneralSettings {
    /** Theme preference */
    theme: 'light' | 'dark' | 'system'
    /** UI language code */
    language: string
    /** Whether to start the app minimized */
    startMinimized: boolean
}

export interface AISettings {
    /** Default AI provider (e.g., 'ollama', 'openai') */
    defaultProvider: string
    /** Default model ID to use */
    defaultModel: string
    /** Optional base URL for the provider */
    providerBaseUrl?: string
    /** Maximum tokens for AI responses */
    maxTokens: number
    /** Temperature for AI responses (0-1) */
    temperature: number
    /** Auto-generate note summaries after creation */
    autoNoteSummary: boolean
    /** Background relationship mapping enabled */
    backgroundMapping: boolean
}

// ============================================================================
// Hardcoded Defaults
// ============================================================================

export const GENERAL_DEFAULTS: GeneralSettings = {
    theme: 'system',
    language: 'en',
    startMinimized: false,
}

export const AI_DEFAULTS: AISettings = {
    defaultProvider: 'ollama',
    defaultModel: 'llama3',
    providerBaseUrl: undefined,
    maxTokens: 4096,
    temperature: 0.7,
    autoNoteSummary: true,
    backgroundMapping: false,
}

// ============================================================================
// Settings Keys (namespaced for database storage)
// ============================================================================

export const SETTINGS_KEYS = {
    // General
    GENERAL_THEME: 'general.theme',
    GENERAL_LANGUAGE: 'general.language',
    GENERAL_START_MINIMIZED: 'general.startMinimized',

    // AI
    AI_DEFAULT_PROVIDER: 'ai.defaultProvider',
    AI_DEFAULT_MODEL: 'ai.defaultModel',
    AI_PROVIDER_BASE_URL: 'ai.providerBaseUrl',
    AI_MAX_TOKENS: 'ai.maxTokens',
    AI_TEMPERATURE: 'ai.temperature',
    AI_AUTO_NOTE_SUMMARY: 'ai.autoNoteSummary',
    AI_BACKGROUND_MAPPING: 'ai.backgroundMapping',

    // System (internal use)
    SCHEMA_VERSION: '_system.schemaVersion',
} as const

export type SettingsKey = typeof SETTINGS_KEYS[keyof typeof SETTINGS_KEYS]

// Current schema version for migrations
export const CURRENT_SCHEMA_VERSION = 1
