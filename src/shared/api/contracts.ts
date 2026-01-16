/**
 * Matriarch API Contracts
 * 
 * Defines the typed interface between renderer and main processes.
 * All IPC communication must go through these contracts.
 * 
 * @see Phase-0 §8.1 - Internal API Layer
 */

// ============================================================================
// System API
// ============================================================================

export interface HealthResponse {
    status: 'ok'
    timestamp: number
    version: string
}

export interface SystemApi {
    /** Check if main process is healthy and responsive */
    health(): Promise<HealthResponse>
}

// ============================================================================
// Settings API
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

export interface SettingsApi {
    /** Get general settings */
    getGeneral(): Promise<GeneralSettings>
    /** Update general settings (partial updates allowed) */
    updateGeneral(settings: Partial<GeneralSettings>): Promise<void>
    /** Get current AI settings */
    getAI(): Promise<AISettings>
    /** Update AI settings (partial updates allowed) */
    updateAI(settings: Partial<AISettings>): Promise<void>
    /** Reset settings to defaults */
    resetToDefaults(category?: 'general' | 'ai'): Promise<void>
}


// ============================================================================
// Agents API
// ============================================================================

export interface ModelOverride {
    provider: string
    model: string
}

export interface AgentInfo {
    id: string
    name: string
    description: string
}

export interface AgentAction {
    type: string
    entityId: string
    entityType?: string
    before?: unknown
    after?: unknown
}

export interface AgentResult {
    success: boolean
    output: unknown
    actions: AgentAction[]
    error?: string
}

export interface AgentLog {
    id: number
    agentId: string
    agentName?: string
    timestamp: Date
    provider?: string
    model?: string
    success: boolean
    error?: string
    actions: AgentAction[]
}

export interface AgentsApi {
    /** List all registered agents */
    list(): Promise<AgentInfo[]>
    /** Execute an agent with optional model override */
    execute(agentId: string, input: unknown, modelOverride?: ModelOverride): Promise<AgentResult>
    /** Get execution logs for an agent */
    getLogs(agentId: string, limit?: number): Promise<AgentLog[]>
}

// ============================================================================
// Collections API
// ============================================================================

export interface Collection {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    folders?: any[] // Todo: Define Folder interface
    placements?: {
        note: Note
        folderId: string | null
    }[]
}

export interface CollectionsApi {
    /** List all collections */
    list(): Promise<Collection[]>
    /** Create a new collection */
    create(name: string): Promise<Collection>
    /** Update a collection */
    update(id: string, data: { name?: string }): Promise<Collection>
    /** Delete a collection */
    delete(id: string): Promise<void>
}

// ============================================================================
// AI Providers API
// ============================================================================

export interface AIProviderInfo {
    id: string
    name: string
    description: string
    enabled: boolean
    available: boolean
    config: Record<string, unknown> | null
}

export interface AvailabilityResult {
    available: boolean
    error?: string
    models?: string[]
}

export interface AIProvidersApi {
    /** List all supported providers with current status */
    list(): Promise<AIProviderInfo[]>
    /** Get configuration for a specific provider */
    getConfig(providerId: string): Promise<Record<string, unknown> | null>
    /** Enable or disable a provider */
    setEnabled(providerId: string, enabled: boolean): Promise<void>
    /** Update configuration for a provider */
    updateConfig(providerId: string, config: Record<string, unknown>): Promise<void>
    /** Check if a provider is available */
    checkAvailability(providerId: string): Promise<AvailabilityResult>
    /** Get available models for a provider (e.g., Ollama) */
    getModels(providerId: string): Promise<string[]>
}

// ============================================================================
// Combined API Facade
// ============================================================================

/**
 * The complete Matriarch API exposed to the renderer process.
 * Access via `window.matriarch` in renderer code.
 */
export interface MatriarchApi {
    system: SystemApi
    settings: SettingsApi
    agents: AgentsApi
    collections: CollectionsApi
    notes: NotesApi
    aiProviders: AIProvidersApi
}

// ============================================================================
// Notes API
// ============================================================================

export interface Note {
    id: string
    title: string
    content: string
    metadata?: string | null
    createdAt: Date
    updatedAt: Date
    placements?: any[] // Todo: Define NotePlacement
    categories?: any[] // Todo: Define Category
}

export interface CreateNoteDTO {
    title: string
    content?: string
    metadata?: Record<string, any>
    collectionId?: string
    folderId?: string
}

export interface UpdateNoteDTO {
    title?: string
    content?: string
    metadata?: Record<string, any>
}

export interface NotesApi {
    /** Create a new note */
    create(data: CreateNoteDTO): Promise<Note>
    /** Get a note by ID */
    read(id: string): Promise<Note | null>
    /** Update a note */
    update(id: string, data: UpdateNoteDTO): Promise<Note>
    /** Delete a note */
    delete(id: string): Promise<void>
}
