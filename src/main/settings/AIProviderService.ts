/**
 * AI Provider Service
 * 
 * Manages AI provider configuration: enable/disable, CRUD for provider configs,
 * and availability checking.
 */

import { DatabaseClient } from '../database/DatabaseClient'
import {
    AIProviderType,
    PROVIDER_METADATA,
    ProviderConfig,
    OllamaConfig,
    OLLAMA_DEFAULTS,
    getDefaultConfig,
} from './providerTypes'

// ============================================================================
// Types
// ============================================================================

export interface AIProviderInfo {
    id: string
    name: string
    description: string
    enabled: boolean
    available: boolean
    config: ProviderConfig | null
}

// ============================================================================
// Provider List
// ============================================================================

/**
 * Get all supported providers with their current status.
 */
export async function getProviders(): Promise<AIProviderInfo[]> {
    const prisma = DatabaseClient.getInstance().getClient()

    const providers: AIProviderInfo[] = []

    for (const type of Object.values(AIProviderType)) {
        const metadata = PROVIDER_METADATA[type]
        const dbProvider = await prisma.aIProvider.findUnique({
            where: { id: type },
            include: { config: true },
        })

        const config = dbProvider?.config?.configJson
            ? JSON.parse(dbProvider.config.configJson)
            : getDefaultConfig(type)

        const available = await checkProviderAvailability(type, config)

        providers.push({
            id: type,
            name: metadata.name,
            description: metadata.description,
            enabled: dbProvider?.enabled ?? false,
            available: available.available,
            config,
        })
    }

    return providers
}

// ============================================================================
// Enable/Disable
// ============================================================================

/**
 * Enable or disable a provider.
 */
export async function setProviderEnabled(
    providerId: string,
    enabled: boolean
): Promise<void> {
    const prisma = DatabaseClient.getInstance().getClient()
    const metadata = PROVIDER_METADATA[providerId as AIProviderType]

    if (!metadata) {
        throw new Error(`Unknown provider: ${providerId}`)
    }

    await prisma.aIProvider.upsert({
        where: { id: providerId },
        update: { enabled },
        create: {
            id: providerId,
            name: metadata.name,
            enabled,
        },
    })
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get configuration for a specific provider.
 */
export async function getProviderConfig(
    providerId: string
): Promise<ProviderConfig | null> {
    const prisma = DatabaseClient.getInstance().getClient()

    const provider = await prisma.aIProvider.findUnique({
        where: { id: providerId },
        include: { config: true },
    })

    if (provider?.config?.configJson) {
        return JSON.parse(provider.config.configJson)
    }

    return getDefaultConfig(providerId as AIProviderType)
}

/**
 * Update configuration for a specific provider.
 */
export async function updateProviderConfig(
    providerId: string,
    config: ProviderConfig
): Promise<void> {
    const prisma = DatabaseClient.getInstance().getClient()
    const metadata = PROVIDER_METADATA[providerId as AIProviderType]

    if (!metadata) {
        throw new Error(`Unknown provider: ${providerId}`)
    }

    // Ensure provider exists
    await prisma.aIProvider.upsert({
        where: { id: providerId },
        update: {},
        create: {
            id: providerId,
            name: metadata.name,
            enabled: false,
        },
    })

    // Upsert config
    await prisma.aIProviderConfig.upsert({
        where: { providerId },
        update: { configJson: JSON.stringify(config) },
        create: {
            providerId,
            configJson: JSON.stringify(config),
        },
    })
}

// ============================================================================
// Availability Check
// ============================================================================

export interface AvailabilityResult {
    available: boolean
    error?: string
    models?: string[]
}

/**
 * Check if a provider is available and responding.
 */
export async function checkProviderAvailability(
    providerId: string,
    config?: ProviderConfig | null
): Promise<AvailabilityResult> {
    switch (providerId) {
        case AIProviderType.OLLAMA:
            return checkOllamaAvailability(config as OllamaConfig | null)
        default:
            return { available: false, error: `Unknown provider: ${providerId}` }
    }
}

/**
 * Check Ollama availability by hitting the tags endpoint.
 */
async function checkOllamaAvailability(
    config: OllamaConfig | null
): Promise<AvailabilityResult> {
    const baseUrl = config?.baseUrl ?? OLLAMA_DEFAULTS.baseUrl

    try {
        const response = await fetch(`${baseUrl}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000), // 5 second timeout
        })

        if (!response.ok) {
            return { available: false, error: `Ollama returned status ${response.status}` }
        }

        const data = await response.json() as { models?: Array<{ name: string }> }
        const models = data.models?.map(m => m.name) ?? []

        return { available: true, models }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Connection failed'
        return { available: false, error: message }
    }
}

/**
 * Get available models for Ollama (convenience function).
 */
export async function getOllamaModels(config?: OllamaConfig | null): Promise<string[]> {
    const result = await checkOllamaAvailability(config ?? null)
    return result.models ?? []
}
