/**
 * Base Agent Class
 * 
 * Abstract base class for all agents.
 * Provides model resolution and action logging.
 * 
 * @see Phase-0 §5 - AI Agent System
 */

import type { LanguageModel } from 'ai'
import { getModel, getAISettings } from '../ai'
import { DatabaseClient } from '../database/DatabaseClient'
import type {
    Agent,
    AgentContext,
    AgentResult,
    AgentAction,
} from './types'

/**
 * Abstract base class that handles common agent functionality.
 * Agents should extend this class and implement the `run` method.
 */
export abstract class BaseAgent implements Agent {
    abstract id: string
    abstract name: string
    abstract description: string

    /**
     * Execute the agent with context.
     * Handles model resolution, execution, and logging.
     */
    async execute(context: AgentContext): Promise<AgentResult> {
        const model = await this.resolveModel(context)
        const contextWithModel: AgentContext = {
            ...context,
            resolvedModel: model,
        }

        let result: AgentResult

        try {
            result = await this.run(contextWithModel)
        } catch (error) {
            result = {
                success: false,
                output: null,
                actions: [],
                error: error instanceof Error ? error.message : String(error),
            }
        }

        // Log the execution
        await this.logExecution(context, result)

        return result
    }

    /**
     * Implement this method to define agent behavior.
     * @param context - Execution context with resolved model
     */
    protected abstract run(context: AgentContext): Promise<AgentResult>

    /**
     * Resolve the model to use based on override or system defaults.
     */
    protected async resolveModel(context: AgentContext): Promise<LanguageModel> {
        if (context.modelOverride) {
            return getModel(
                context.modelOverride.provider,
                context.modelOverride.model
            )
        }

        const settings = await getAISettings()
        return getModel(settings.defaultProvider, settings.defaultModel)
    }

    /**
     * Log agent execution for auditing (Phase-0 §5.3).
     */
    private async logExecution(
        context: AgentContext,
        result: AgentResult
    ): Promise<void> {
        try {
            const db = DatabaseClient.getInstance().getClient()
            const settings = await getAISettings()

            // Determine which model was used
            const provider = context.modelOverride?.provider ?? settings.defaultProvider
            const model = context.modelOverride?.model ?? settings.defaultModel

            // Create the log entry
            await db.agentLog.create({
                data: {
                    agentId: this.id,
                    agentName: this.name,
                    provider,
                    model,
                    input: context.input ? JSON.stringify(context.input) : null,
                    success: result.success,
                    error: result.error,
                    actions: {
                        create: result.actions.map(action => ({
                            type: action.type,
                            entityId: action.entityId,
                            entityType: action.entityType,
                            before: action.before ? JSON.stringify(action.before) : null,
                            after: action.after ? JSON.stringify(action.after) : null,
                        })),
                    },
                },
            })
        } catch (error) {
            // Log but don't fail the agent execution
            console.error('Failed to log agent execution:', error)
        }
    }
}
