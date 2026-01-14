export class AgentOrchestrator {
    private static instance: AgentOrchestrator
    private agents: Map<string, any> = new Map()

    private constructor() {
        // Singleton
    }

    public static getInstance(): AgentOrchestrator {
        if (!AgentOrchestrator.instance) {
            AgentOrchestrator.instance = new AgentOrchestrator()
        }
        return AgentOrchestrator.instance
    }

    public registerAgent(agentId: string, agent: any) {
        console.log(`Registering agent: ${agentId}`)
        this.agents.set(agentId, agent)
    }

    public getAgent(agentId: string) {
        return this.agents.get(agentId)
    }
}
