/**
 * Agent System Types
 * 
 * Defines the core interfaces for the agent system.
 * Agents are first-class system actors that can mutate state.
 * 
 * @see Phase-0 §5 - AI Agent System
 */

import type { LanguageModel } from 'ai'

// ============================================================================
// Agent Context
// ============================================================================

/**
 * Model override configuration for per-task model selection.
 */
export interface ModelOverride {
    provider: string
    model: string
}

/**
 * Context passed to agent execution.
 */
export interface AgentContext {
    /** Input data for the agent */
    input: unknown
    /** Optional model override - if not specified, uses system default */
    modelOverride?: ModelOverride
    /** Resolved language model (set by orchestrator) */
    resolvedModel?: LanguageModel
}

// ============================================================================
// Agent Actions (for auditing)
// ============================================================================

/**
 * Types of actions an agent can perform.
 */
export type AgentActionType =
    | 'note:create'
    | 'note:update'
    | 'note:delete'
    | 'task:create'
    | 'task:update'
    | 'task:transition'
    | 'metadata:modify'
    | 'collection:modify'

/**
 * Record of an action performed by an agent.
 * Used for audit logging (Phase-0 §5.3).
 */
export interface AgentAction {
    type: AgentActionType
    entityId: string
    entityType: 'note' | 'task' | 'collection' | 'metadata'
    before?: unknown
    after?: unknown
}

// ============================================================================
// Agent Result
// ============================================================================

/**
 * Result of agent execution.
 */
export interface AgentResult {
    success: boolean
    output: unknown
    /** All actions performed during execution */
    actions: AgentAction[]
    /** Optional error message if success is false */
    error?: string
}

// ============================================================================
// Agent Interface
// ============================================================================

/**
 * Read-only information about an agent.
 */
export interface AgentInfo {
    id: string
    name: string
    description: string
}

/**
 * Core agent interface that all agents must implement.
 */
export interface Agent extends AgentInfo {
    /**
     * Execute the agent with the given context.
     * @param context - Execution context including input and model
     * @returns Result of execution including actions taken
     */
    execute(context: AgentContext): Promise<AgentResult>
}
