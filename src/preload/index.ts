/**
 * Preload Script
 * Exposes typed Matriarch API to renderer process.
 * 
 * @see Phase-0 §8.1 - Internal API Layer
 */

import { ipcRenderer, contextBridge } from 'electron'
import { CHANNELS } from '../shared/api/channels'
import type { MatriarchApi, ModelOverride } from '../shared/api/contracts'

/**
 * Typed API facade exposed to window.matriarch
 * All renderer-to-main communication goes through this interface.
 */
const matriarch: MatriarchApi = {
    system: {
        health: () => ipcRenderer.invoke(CHANNELS.SYSTEM.HEALTH),
    },
    settings: {
        getAI: () => ipcRenderer.invoke(CHANNELS.SETTINGS.GET_AI),
        updateAI: (settings) => ipcRenderer.invoke(CHANNELS.SETTINGS.UPDATE_AI, settings),
    },
    agents: {
        list: () => ipcRenderer.invoke(CHANNELS.AGENTS.LIST),
        execute: (agentId: string, input: unknown, modelOverride?: ModelOverride) =>
            ipcRenderer.invoke(CHANNELS.AGENTS.EXECUTE, agentId, input, modelOverride),
        getLogs: (agentId: string, limit?: number) =>
            ipcRenderer.invoke(CHANNELS.AGENTS.GET_LOGS, agentId, limit),
    },
    collections: {
        list: () => ipcRenderer.invoke(CHANNELS.COLLECTIONS.LIST),
        create: (name: string) => ipcRenderer.invoke(CHANNELS.COLLECTIONS.CREATE, name),
    },
}

// Expose the typed API to the renderer
contextBridge.exposeInMainWorld('matriarch', matriarch)

// Keep legacy ipcRenderer for any existing code during migration
// TODO: Remove once all code is migrated to window.matriarch
contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...omit] = args
        return ipcRenderer.off(channel, ...omit)
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...omit] = args
        return ipcRenderer.send(channel, ...omit)
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...omit] = args
        return ipcRenderer.invoke(channel, ...omit)
    },
})
