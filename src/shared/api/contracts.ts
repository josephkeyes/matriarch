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

export interface AISettings {
    defaultProvider: string
    defaultModel: string
    providerBaseUrl?: string
}

export interface SettingsApi {
    /** Get current AI settings */
    getAI(): Promise<AISettings>
    /** Update AI settings (partial updates allowed) */
    updateAI(settings: Partial<AISettings>): Promise<void>
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
}
