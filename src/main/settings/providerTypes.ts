/**
 * AI Provider Types
 * 
 * Defines provider identifiers, configuration schemas, and defaults.
 * @see Phase-1 AI Settings
 */

// ============================================================================
// Provider Identifiers
// ============================================================================

export enum AIProviderType {
    OLLAMA = 'ollama',
    // Future: APPLE_INTELLIGENCE = 'apple-intelligence',
}

// ============================================================================
// Provider Metadata
// ============================================================================

export interface ProviderMetadata {
    id: AIProviderType
    name: string
    description: string
    icon?: string
}

export const PROVIDER_METADATA: Record<AIProviderType, ProviderMetadata> = {
    [AIProviderType.OLLAMA]: {
        id: AIProviderType.OLLAMA,
        name: 'Ollama',
        description: 'Run open-source LLMs locally with Ollama',
        icon: 'terminal',
    },
}

// ============================================================================
// Provider Configuration Schemas
// ============================================================================

export interface OllamaConfig {
    /** Base URL for Ollama API (default: http://localhost:11434) */
    baseUrl: string
    /** Default model to use (e.g., llama3.2, phi3, mistral) */
    defaultModel: string
}

// Union of all provider configs for type safety
export type ProviderConfig = OllamaConfig

// ============================================================================
// Defaults
// ============================================================================

export const OLLAMA_DEFAULTS: OllamaConfig = {
    baseUrl: 'http://localhost:11434',
    defaultModel: 'llama3.2',
}

export function getDefaultConfig(providerId: AIProviderType): ProviderConfig | null {
    switch (providerId) {
        case AIProviderType.OLLAMA:
            return { ...OLLAMA_DEFAULTS }
        default:
            return null
    }
}
