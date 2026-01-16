/**
 * Command Types and Interfaces
 * 
 * Shared types for the command palette system.
 */

export type CommandType = 'navigation' | 'crud' | 'application' | 'agent'
export type CommandActionType = 'navigate' | 'execute' | 'toggle' | 'agent-execute'
export type CommandSource = 'system' | 'user' | 'plugin'

export interface CommandActionPayload {
    // Navigation actions
    route?: string

    // Agent actions  
    agentId?: string

    // Generic parameters
    params?: Record<string, unknown>

    // Index signature for Record<string, unknown> compatibility
    [key: string]: unknown
}

export interface CommandDefinition {
    id: string
    name: string
    description?: string
    type: CommandType
    actionType: CommandActionType
    actionPayload?: CommandActionPayload
    enabled: boolean
    isBuiltIn: boolean
    source: CommandSource
    category?: string
    hotkeys: HotkeyDefinition[]
}

export interface HotkeyDefinition {
    id: string
    accelerator: string
    isGlobal: boolean
}

export interface CreateCommandInput {
    name: string
    description?: string
    type: CommandType
    actionType: CommandActionType
    actionPayload?: CommandActionPayload
    category?: string
    source?: CommandSource
}

export interface UpdateCommandInput {
    name?: string
    description?: string
    enabled?: boolean
    actionPayload?: CommandActionPayload
    category?: string
}

export interface CommandExecutionContext {
    /** Current note ID if executing in note context */
    noteId?: string
    /** Selected text in the current note */
    selectedText?: string
    /** Additional parameters */
    params?: Record<string, unknown>
}

export interface CommandExecutionResult {
    success: boolean
    error?: string
    output?: unknown
}
