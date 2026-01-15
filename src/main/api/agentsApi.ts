/**
 * Agents API Handlers
 * Implements agent-related IPC endpoints.
 */

import { ipcMain } from 'electron'
import { CHANNELS } from '../../shared/api/channels'
import { AgentOrchestrator, type AgentInfo, type AgentResult, type ModelOverride } from '../agents/AgentOrchestrator'
import { DatabaseClient } from '../database/DatabaseClient'

/**
 * Register agents API handlers.
 */
export function registerAgentsApi(): void {
    ipcMain.handle(CHANNELS.AGENTS.LIST, async (): Promise<AgentInfo[]> => {
        const orchestrator = AgentOrchestrator.getInstance()
        return orchestrator.listAgents()
    })

    ipcMain.handle(
        CHANNELS.AGENTS.EXECUTE,
        async (
            _,
            agentId: string,
            input: unknown,
            modelOverride?: ModelOverride
        ): Promise<AgentResult> => {
            const orchestrator = AgentOrchestrator.getInstance()
            return orchestrator.executeAgent(agentId, input, modelOverride)
        }
    )

    ipcMain.handle(
        CHANNELS.AGENTS.GET_LOGS,
        async (_, agentId: string, limit: number = 50) => {
            const db = DatabaseClient.getInstance().getClient()
            return db.agentLog.findMany({
                where: { agentId },
                include: { actions: true },
                orderBy: { timestamp: 'desc' },
                take: limit,
            })
        }
    )
}
