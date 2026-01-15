/**
 * Agent Orchestrator
 * 
 * Central coordinator for agent registration, lifecycle, and execution.
 * 
 * @see Phase-0 §5.1 - Agent Model
 */

import type { Agent, AgentContext, AgentResult, AgentInfo, ModelOverride } from './types'
import { getModel, getAISettings } from '../ai'

export class AgentOrchestrator {
    private static instance: AgentOrchestrator
    private agents: Map<string, Agent> = new Map()

    private constructor() {
        // Singleton
    }

    public static getInstance(): AgentOrchestrator {
        if (!AgentOrchestrator.instance) {
            AgentOrchestrator.instance = new AgentOrchestrator()
        }
        return AgentOrchestrator.instance
    }

    /**
     * Register an agent with the orchestrator.
     */
    public registerAgent(agent: Agent): void {
        if (this.agents.has(agent.id)) {
            console.warn(`Agent ${agent.id} is already registered, replacing...`)
        }
        console.log(`Registering agent: ${agent.id} (${agent.name})`)
        this.agents.set(agent.id, agent)
    }

    /**
     * Unregister an agent.
     */
    public unregisterAgent(agentId: string): boolean {
        const removed = this.agents.delete(agentId)
        if (removed) {
            console.log(`Unregistered agent: ${agentId}`)
        }
        return removed
    }

    /**
     * Get an agent by ID.
     */
    public getAgent(agentId: string): Agent | undefined {
        return this.agents.get(agentId)
    }

    /**
     * List all registered agents.
     */
    public listAgents(): AgentInfo[] {
        return Array.from(this.agents.values()).map(agent => ({
            id: agent.id,
            name: agent.name,
            description: agent.description,
        }))
    }

    /**
     * Execute an agent with the given input and optional model override.
     */
    public async executeAgent(
        agentId: string,
        input: unknown,
        modelOverride?: ModelOverride
    ): Promise<AgentResult> {
        const agent = this.agents.get(agentId)

        if (!agent) {
            return {
                success: false,
                output: null,
                actions: [],
                error: `Agent not found: ${agentId}`,
            }
        }

        const context: AgentContext = {
            input,
            modelOverride,
        }

        console.log(`Executing agent: ${agentId} (${agent.name})`)

        try {
            const result = await agent.execute(context)
            console.log(`Agent ${agentId} completed: success=${result.success}`)
            return result
        } catch (error) {
            console.error(`Agent ${agentId} failed:`, error)
            return {
                success: false,
                output: null,
                actions: [],
                error: error instanceof Error ? error.message : String(error),
            }
        }
    }

    /**
     * Get count of registered agents.
     */
    public get agentCount(): number {
        return this.agents.size
    }
}

// Re-export types for convenience
export type { Agent, AgentContext, AgentResult, AgentInfo, AgentAction, ModelOverride } from './types'
export { BaseAgent } from './BaseAgent'
