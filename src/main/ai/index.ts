/**
 * AI Client Layer
 * 
 * Provides a unified interface to AI models across providers.
 * Uses Vercel AI SDK for provider abstraction.
 * 
 * @see Phase-0 §6.3 - AI Integration Layer
 */

import { generateText, LanguageModel } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'
import { getAISettings, AISettings } from './settings'

// ============================================================================
// Provider Registry
// ============================================================================

type ProviderFactory = (model: string) => LanguageModel

const providers: Record<string, ProviderFactory> = {
    ollama: (model: string) => {
        // Note: Ollama base URL can be configured via OLLAMA_HOST environment variable
        return ollama(model)
    },
    // Future providers will be added here:
    // openai: (model) => openai(model),
    // anthropic: (model) => anthropic(model),
}

/**
 * Get a language model instance for the given provider and model ID.
 */
export function getModel(provider: string, modelId: string): LanguageModel {
    const factory = providers[provider]
    if (!factory) {
        throw new Error(`Unknown AI provider: ${provider}. Available: ${Object.keys(providers).join(', ')}`)
    }
    return factory(modelId)
}

/**
 * Get the default model based on system settings.
 */
export async function getDefaultModel(): Promise<LanguageModel> {
    const settings = await getAISettings()
    return getModel(settings.defaultProvider, settings.defaultModel)
}

// ============================================================================
// Generation API
// ============================================================================

export interface GenerateOptions {
    prompt: string
    model?: LanguageModel
    maxTokens?: number
    temperature?: number
}

/**
 * Generate text using the specified or default model.
 */
export async function generate(options: GenerateOptions): Promise<string> {
    const model = options.model ?? await getDefaultModel()

    const { text } = await generateText({
        model,
        prompt: options.prompt,
    })

    return text
}

// Re-export types for convenience
export type { AISettings } from './settings'
export { getAISettings, updateAISettings, resetAISettings } from './settings'
