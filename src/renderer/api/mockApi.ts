/**
 * Mock API for Browser Development
 * 
 * This module provides a dummy implementation of the Matriarch API
 * to allow UI development in standard browsers where Electron's
 * preload script is not available.
 */

import { MatriarchApi, Collection } from '../../shared/api/contracts'

// In-memory store for development
let collections: Collection[] = [
    { id: '1', name: 'Mock Research', createdAt: new Date(), updatedAt: new Date(), folders: [], placements: [] },
    { id: '2', name: 'Mock Project', createdAt: new Date(), updatedAt: new Date(), folders: [], placements: [] },
]

export const mockApi: MatriarchApi = {
    system: {
        health: async () => ({ status: 'ok', timestamp: Date.now(), version: 'mock-0.0.1' }),
    },
    settings: {
        getGeneral: async () => ({
            theme: 'system' as const,
            language: 'en',
            startMinimized: false,
        }),
        updateGeneral: async (s) => console.log('Mock updateGeneral:', s),
        getAI: async () => ({
            defaultProvider: 'mock',
            defaultModel: 'mock-gpt',
            maxTokens: 4096,
            temperature: 0.7,
            autoNoteSummary: true,
            backgroundMapping: false,
        }),
        updateAI: async (s) => console.log('Mock updateAI:', s),
        resetToDefaults: async (category) => console.log('Mock resetToDefaults:', category),
    },
    agents: {
        list: async () => [],
        execute: async () => ({ success: true, output: 'Mock agent output', actions: [] }),
        getLogs: async () => [],
    },
    collections: {
        list: async () => [...collections],
        create: async (name: string) => {
            const newCol = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                createdAt: new Date(),
                updatedAt: new Date(),
                folders: [],
                placements: []
            }
            collections.push(newCol)
            return newCol
        },
        update: async (id, data) => {
            const index = collections.findIndex(c => c.id === id)
            if (index !== -1) {
                collections[index] = { ...collections[index], ...data, updatedAt: new Date() }
                return collections[index]
            }
            throw new Error('Collection not found')
        },
        delete: async (id) => {
            collections = collections.filter(c => c.id !== id)
        }
    },
    notes: {
        create: async (data) => ({
            id: Math.random().toString(36).substr(2, 9),
            title: data.title,
            content: data.content || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
        read: async () => null,
        update: async (id, data) => ({
            id,
            title: data.title || 'Untitled',
            content: data.content || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
        delete: async () => { },
    },
    aiProviders: {
        list: async () => [{
            id: 'ollama',
            name: 'Ollama',
            description: 'Run open-source LLMs locally with Ollama',
            enabled: false,
            available: false,
            config: { baseUrl: 'http://localhost:11434', defaultModel: 'llama3.2' },
        }],
        getConfig: async () => ({ baseUrl: 'http://localhost:11434', defaultModel: 'llama3.2' }),
        setEnabled: async (providerId, enabled) => console.log('Mock setEnabled:', providerId, enabled),
        updateConfig: async (providerId, config) => console.log('Mock updateConfig:', providerId, config),
        checkAvailability: async () => ({ available: false, error: 'Mock - Ollama not running' }),
        getModels: async () => [],
    },
    commands: {
        list: async () => [
            {
                id: 'nav.dashboard',
                name: 'Go to Dashboard',
                description: 'Navigate to the main dashboard view',
                type: 'navigation' as const,
                actionType: 'navigate' as const,
                actionPayload: { route: 'dashboard' },
                enabled: true,
                isBuiltIn: true,
                source: 'system' as const,
                category: 'Navigation',
                hotkeys: [{ id: '1', accelerator: 'CommandOrControl+Shift+D', isGlobal: false }],
            },
            {
                id: 'app.command-palette',
                name: 'Open Command Palette',
                description: 'Open the command palette',
                type: 'application' as const,
                actionType: 'execute' as const,
                actionPayload: { params: { action: 'open-palette' } },
                enabled: true,
                isBuiltIn: true,
                source: 'system' as const,
                category: 'Application',
                hotkeys: [{ id: '2', accelerator: 'CommandOrControl+Shift+P', isGlobal: true }],
            },
        ],
        get: async () => null,
        create: async (data) => ({
            id: Math.random().toString(36).substr(2, 9),
            ...data,
            enabled: true,
            isBuiltIn: false,
            source: 'user' as const,
            hotkeys: [],
        }),
        update: async (id, data) => ({
            id,
            name: data.name || 'Command',
            type: 'application' as const,
            actionType: 'execute' as const,
            enabled: data.enabled ?? true,
            isBuiltIn: false,
            source: 'user' as const,
            hotkeys: [],
        }),
        delete: async () => { },
        execute: async () => ({ success: true }),
        addHotkey: async (commandId, accelerator, isGlobal) => ({
            id: Math.random().toString(36).substr(2, 9),
            accelerator,
            isGlobal: isGlobal ?? false,
        }),
        removeHotkey: async () => { },
        updateHotkey: async (hotkeyId, accelerator) => ({
            id: hotkeyId,
            accelerator,
            isGlobal: false,
        }),
    },
}

