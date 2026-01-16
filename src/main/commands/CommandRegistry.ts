/**
 * Command Registry
 * 
 * Central service for managing commands. Handles command CRUD operations,
 * seeding built-in commands, and executing commands.
 * 
 * @see Implementation Plan - Command Palette Feature
 */

import { DatabaseClient } from '../database/DatabaseClient'
import { AgentOrchestrator } from '../agents/AgentOrchestrator'
import { BUILT_IN_COMMANDS, type BuiltInCommand } from './builtInCommands'
import type {
    CommandDefinition,
    HotkeyDefinition,
    CreateCommandInput,
    UpdateCommandInput,
    CommandExecutionContext,
    CommandExecutionResult,
    CommandType,
    CommandActionPayload,
} from './types'

export class CommandRegistry {
    private static instance: CommandRegistry
    private initialized = false

    private constructor() {
        // Singleton
    }

    public static getInstance(): CommandRegistry {
        if (!CommandRegistry.instance) {
            CommandRegistry.instance = new CommandRegistry()
        }
        return CommandRegistry.instance
    }

    /**
     * Initialize the command registry.
     * Loads commands from database and seeds built-in commands if needed.
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('[CommandRegistry] Already initialized')
            return
        }

        console.log('[CommandRegistry] Initializing...')
        await this.seedBuiltInCommands()
        this.initialized = true
        console.log('[CommandRegistry] Initialization complete')
    }

    /**
     * Seed built-in commands into the database if they don't exist.
     */
    private async seedBuiltInCommands(): Promise<void> {
        const prisma = DatabaseClient.getInstance().getClient()

        for (const cmd of BUILT_IN_COMMANDS) {
            const existing = await prisma.command.findUnique({
                where: { id: cmd.id }
            })

            if (!existing) {
                console.log(`[CommandRegistry] Seeding built-in command: ${cmd.id}`)
                await this.createCommandFromBuiltIn(cmd)
            }
        }
    }

    /**
     * Create a command from a built-in definition.
     */
    private async createCommandFromBuiltIn(cmd: BuiltInCommand): Promise<void> {
        const prisma = DatabaseClient.getInstance().getClient()

        const command = await prisma.command.create({
            data: {
                id: cmd.id,
                name: cmd.name,
                description: cmd.description,
                type: cmd.type,
                actionType: cmd.actionType,
                actionPayload: cmd.actionPayload ? JSON.stringify(cmd.actionPayload) : null,
                enabled: true,
                isBuiltIn: true,
                source: cmd.source ?? 'system',
                category: cmd.category,
            }
        })

        // Create default hotkey if specified
        if (cmd.defaultHotkey) {
            await prisma.commandHotkey.create({
                data: {
                    commandId: command.id,
                    accelerator: cmd.defaultHotkey,
                    isGlobal: cmd.defaultIsGlobal ?? false,
                }
            })
        }
    }

    /**
     * List all commands, optionally filtered by type or enabled state.
     */
    public async listCommands(filter?: {
        type?: CommandType
        enabled?: boolean
    }): Promise<CommandDefinition[]> {
        const prisma = DatabaseClient.getInstance().getClient()

        const where: Record<string, unknown> = {}
        if (filter?.type) where.type = filter.type
        if (filter?.enabled !== undefined) where.enabled = filter.enabled

        const commands = await prisma.command.findMany({
            where,
            include: { hotkeys: true },
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ]
        })

        return commands.map(this.mapCommandToDefinition)
    }

    /**
     * Get a single command by ID.
     */
    public async getCommand(id: string): Promise<CommandDefinition | null> {
        const prisma = DatabaseClient.getInstance().getClient()

        const command = await prisma.command.findUnique({
            where: { id },
            include: { hotkeys: true }
        })

        return command ? this.mapCommandToDefinition(command) : null
    }

    /**
     * Create a new user command.
     */
    public async createCommand(input: CreateCommandInput): Promise<CommandDefinition> {
        const prisma = DatabaseClient.getInstance().getClient()

        const command = await prisma.command.create({
            data: {
                name: input.name,
                description: input.description,
                type: input.type,
                actionType: input.actionType,
                actionPayload: input.actionPayload ? JSON.stringify(input.actionPayload) : null,
                enabled: true,
                isBuiltIn: false,
                source: input.source ?? 'user',
                category: input.category,
            },
            include: { hotkeys: true }
        })

        return this.mapCommandToDefinition(command)
    }

    /**
     * Update an existing command.
     */
    public async updateCommand(id: string, input: UpdateCommandInput): Promise<CommandDefinition> {
        const prisma = DatabaseClient.getInstance().getClient()

        const updateData: Record<string, unknown> = {}
        if (input.name !== undefined) updateData.name = input.name
        if (input.description !== undefined) updateData.description = input.description
        if (input.enabled !== undefined) updateData.enabled = input.enabled
        if (input.actionPayload !== undefined) {
            updateData.actionPayload = JSON.stringify(input.actionPayload)
        }
        if (input.category !== undefined) updateData.category = input.category

        const command = await prisma.command.update({
            where: { id },
            data: updateData,
            include: { hotkeys: true }
        })

        return this.mapCommandToDefinition(command)
    }

    /**
     * Delete a command. Only user/plugin commands can be deleted.
     */
    public async deleteCommand(id: string): Promise<void> {
        const prisma = DatabaseClient.getInstance().getClient()

        const command = await prisma.command.findUnique({ where: { id } })

        if (!command) {
            throw new Error(`Command not found: ${id}`)
        }

        if (command.isBuiltIn) {
            throw new Error('Cannot delete built-in commands')
        }

        await prisma.command.delete({ where: { id } })
    }

    /**
     * Add a hotkey to a command.
     */
    public async addHotkey(
        commandId: string,
        accelerator: string,
        isGlobal = false
    ): Promise<HotkeyDefinition> {
        const prisma = DatabaseClient.getInstance().getClient()

        // Check for conflicts
        const existing = await prisma.commandHotkey.findUnique({
            where: { accelerator }
        })

        if (existing) {
            throw new Error(`Hotkey ${accelerator} is already assigned to another command`)
        }

        const hotkey = await prisma.commandHotkey.create({
            data: {
                commandId,
                accelerator,
                isGlobal,
            }
        })

        return {
            id: hotkey.id,
            accelerator: hotkey.accelerator,
            isGlobal: hotkey.isGlobal,
        }
    }

    /**
     * Remove a hotkey.
     */
    public async removeHotkey(hotkeyId: string): Promise<void> {
        const prisma = DatabaseClient.getInstance().getClient()
        await prisma.commandHotkey.delete({ where: { id: hotkeyId } })
    }

    /**
     * Update a hotkey's accelerator.
     */
    public async updateHotkey(hotkeyId: string, accelerator: string): Promise<HotkeyDefinition> {
        const prisma = DatabaseClient.getInstance().getClient()

        // Check for conflicts (excluding current hotkey)
        const existing = await prisma.commandHotkey.findFirst({
            where: {
                accelerator,
                NOT: { id: hotkeyId }
            }
        })

        if (existing) {
            throw new Error(`Hotkey ${accelerator} is already assigned to another command`)
        }

        const hotkey = await prisma.commandHotkey.update({
            where: { id: hotkeyId },
            data: { accelerator }
        })

        return {
            id: hotkey.id,
            accelerator: hotkey.accelerator,
            isGlobal: hotkey.isGlobal,
        }
    }

    /**
     * Execute a command.
     */
    public async executeCommand(
        id: string,
        context?: CommandExecutionContext
    ): Promise<CommandExecutionResult> {
        const command = await this.getCommand(id)

        if (!command) {
            return { success: false, error: `Command not found: ${id}` }
        }

        if (!command.enabled) {
            return { success: false, error: `Command is disabled: ${id}` }
        }

        console.log(`[CommandRegistry] Executing command: ${command.name} (${id})`)

        try {
            switch (command.actionType) {
                case 'navigate':
                    // Navigation is handled by renderer via IPC event
                    return {
                        success: true,
                        output: { action: 'navigate', route: command.actionPayload?.route }
                    }

                case 'toggle':
                    // Toggle actions are handled by renderer via IPC event
                    return {
                        success: true,
                        output: { action: 'toggle', params: command.actionPayload?.params }
                    }

                case 'execute':
                    // Generic execute actions are handled by renderer
                    return {
                        success: true,
                        output: { action: 'execute', params: command.actionPayload?.params }
                    }

                case 'agent-execute':
                    return await this.executeAgentCommand(command, context)

                default:
                    return { success: false, error: `Unknown actionType: ${command.actionType}` }
            }
        } catch (error) {
            console.error(`[CommandRegistry] Command execution failed:`, error)
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            }
        }
    }

    /**
     * Execute an agent-based command.
     */
    private async executeAgentCommand(
        command: CommandDefinition,
        context?: CommandExecutionContext
    ): Promise<CommandExecutionResult> {
        const agentId = command.actionPayload?.agentId

        if (!agentId) {
            return { success: false, error: 'No agentId specified in command payload' }
        }

        const orchestrator = AgentOrchestrator.getInstance()
        const result = await orchestrator.executeAgent(agentId, {
            noteId: context?.noteId,
            selectedText: context?.selectedText,
            ...context?.params,
        })

        return {
            success: result.success,
            error: result.error,
            output: result.output,
        }
    }

    /**
     * Map a Prisma command to a CommandDefinition.
     */
    private mapCommandToDefinition(command: {
        id: string
        name: string
        description: string | null
        type: string
        actionType: string
        actionPayload: string | null
        enabled: boolean
        isBuiltIn: boolean
        source: string
        category: string | null
        hotkeys: Array<{
            id: string
            accelerator: string
            isGlobal: boolean
        }>
    }): CommandDefinition {
        let parsedPayload: CommandActionPayload | undefined
        if (command.actionPayload) {
            try {
                parsedPayload = JSON.parse(command.actionPayload)
            } catch {
                console.warn(`[CommandRegistry] Failed to parse actionPayload for ${command.id}`)
            }
        }

        return {
            id: command.id,
            name: command.name,
            description: command.description ?? undefined,
            type: command.type as CommandDefinition['type'],
            actionType: command.actionType as CommandDefinition['actionType'],
            actionPayload: parsedPayload,
            enabled: command.enabled,
            isBuiltIn: command.isBuiltIn,
            source: command.source as CommandDefinition['source'],
            category: command.category ?? undefined,
            hotkeys: command.hotkeys.map(h => ({
                id: h.id,
                accelerator: h.accelerator,
                isGlobal: h.isGlobal,
            })),
            defaultHotkey: command.isBuiltIn
                ? BUILT_IN_COMMANDS.find(b => b.id === command.id)?.defaultHotkey
                : undefined,
        }
    }
}
