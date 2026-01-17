/**
 * AI Action Service
 * 
 * Manages AI Actions: CRUD, Execution, and Logging.
 */

import { DatabaseClient } from '../database/DatabaseClient'
import { generateCompletion } from './AIProviderService'
import { AIAction, AIActionLog } from '../../shared/api/contracts'

// ============================================================================
// Types
// ============================================================================

export type CreateAIActionDTO = Omit<AIAction, 'id' | 'enabled'>
export type UpdateAIActionDTO = Partial<Omit<AIAction, 'id'>>

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * List all AI Actions.
 */
export async function listActions(): Promise<AIAction[]> {
    const prisma = DatabaseClient.getInstance().getClient()

    const actions = await prisma.aIAction.findMany({
        orderBy: { name: 'asc' }
    })

    // Map Prisma result to API contract (handle simple type conversions if needed)
    return actions.map(action => ({
        ...action,
        description: action.description || undefined,
        outputBehavior: action.outputBehavior as any // Cast string to union type
    }))
}

/**
 * Create a new AI Action.
 */
export async function createAction(data: CreateAIActionDTO): Promise<AIAction> {
    const prisma = DatabaseClient.getInstance().getClient()

    const action = await prisma.aIAction.create({
        data: {
            ...data,
            enabled: true
        }
    })

    return {
        ...action,
        description: action.description || undefined,
        outputBehavior: action.outputBehavior as any
    }
}

/**
 * Update an existing AI Action.
 */
export async function updateAction(id: string, data: UpdateAIActionDTO): Promise<AIAction> {
    const prisma = DatabaseClient.getInstance().getClient()

    const action = await prisma.aIAction.update({
        where: { id },
        data
    })

    return {
        ...action,
        description: action.description || undefined,
        outputBehavior: action.outputBehavior as any
    }
}

/**
 * Delete an AI Action.
 */
export async function deleteAction(id: string): Promise<void> {
    const prisma = DatabaseClient.getInstance().getClient()

    await prisma.aIAction.delete({
        where: { id }
    })
}

// ============================================================================
// Execution
// ============================================================================

export interface ExecuteActionResult {
    success: boolean
    output?: string
    error?: string
}

/**
 * Execute an AI Action on a given text selection.
 */
export async function executeAction(actionId: string, selection: string): Promise<ExecuteActionResult> {
    const prisma = DatabaseClient.getInstance().getClient()
    const startTime = Date.now()

    // 1. Fetch Action
    const action = await prisma.aIAction.findUnique({
        where: { id: actionId }
    })

    if (!action) {
        return { success: false, error: 'Action not found' }
    }

    // 2. Prepare Prompt
    let userPrompt = action.userPromptTemplate
    if (userPrompt.includes('{{selection}}')) {
        userPrompt = userPrompt.replace('{{selection}}', selection)
    } else {
        // Fallback: Append selection if placeholder is missing
        userPrompt = `${userPrompt}\n\n${selection}`
    }

    try {
        // 3. Call Provider
        const result = await generateCompletion({
            providerId: action.providerId,
            modelId: action.modelId,
            systemPrompt: action.systemPrompt,
            userPrompt: userPrompt
        })

        const durationMs = Date.now() - startTime

        // 4. Log Success
        await prisma.aIActionLog.create({
            data: {
                actionId,
                provider: action.providerId,
                model: action.modelId,
                tokensIn: result.tokensIn,
                tokensOut: result.tokensOut,
                durationMs,
                status: 'success'
            }
        })

        return { success: true, output: result.content }

    } catch (error) {
        const durationMs = Date.now() - startTime
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // 5. Log Failure
        await prisma.aIActionLog.create({
            data: {
                actionId,
                provider: action.providerId,
                model: action.modelId,
                durationMs,
                status: 'failure',
                error: errorMessage
            }
        })

        return { success: false, error: errorMessage }
    }
}

/**
 * Get logs for a specific action.
 */
export async function getActionLogs(actionId: string, limit: number = 50): Promise<AIActionLog[]> {
    const prisma = DatabaseClient.getInstance().getClient()

    const logs = await prisma.aIActionLog.findMany({
        where: { actionId },
        orderBy: { timestamp: 'desc' },
        take: limit
    })

    return logs.map(log => ({
        ...log,
        tokensIn: log.tokensIn || undefined,
        tokensOut: log.tokensOut || undefined,
        error: log.error || undefined,
        status: log.status as 'success' | 'failure'
    }))
}
