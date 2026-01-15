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
        getAI: async () => ({ defaultProvider: 'mock', defaultModel: 'mock-gpt' }),
        updateAI: async (s) => console.log('Mock updateAI:', s),
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
    }
}
