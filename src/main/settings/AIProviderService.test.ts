import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DatabaseClient } from '../database/DatabaseClient'
import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
    getProviders,
    setProviderEnabled,
    getProviderConfig,
    updateProviderConfig,
} from './AIProviderService'
import { AIProviderType, OLLAMA_DEFAULTS } from './providerTypes'

// Mock Electron
vi.mock('electron', () => ({
    app: { getPath: vi.fn() },
    ipcMain: { handle: vi.fn() }
}))

// Mock fetch for availability checks
global.fetch = vi.fn()

describe('AIProviderService', () => {
    let tempDir: string

    beforeEach(async () => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'matriarch-test-provider-'))
        vi.mocked(app.getPath).mockReturnValue(tempDir)
        // @ts-ignore
        DatabaseClient.instance = undefined
        await DatabaseClient.getInstance().initialize()

        // Mock fetch to return connection failure by default
        vi.mocked(global.fetch).mockRejectedValue(new Error('Connection refused'))
    })

    afterEach(() => {
        try { fs.rmSync(tempDir, { recursive: true, force: true }) } catch { }
    })

    it('should list all providers with defaults', async () => {
        const providers = await getProviders()

        expect(providers).toHaveLength(1)
        expect(providers[0].id).toBe('ollama')
        expect(providers[0].name).toBe('Ollama')
        expect(providers[0].enabled).toBe(false)
        expect(providers[0].config).toEqual(OLLAMA_DEFAULTS)
    })

    it('should enable and disable a provider', async () => {
        // Enable
        await setProviderEnabled(AIProviderType.OLLAMA, true)
        let providers = await getProviders()
        expect(providers[0].enabled).toBe(true)

        // Disable
        await setProviderEnabled(AIProviderType.OLLAMA, false)
        providers = await getProviders()
        expect(providers[0].enabled).toBe(false)
    })

    it('should update provider config', async () => {
        const newConfig = {
            baseUrl: 'http://192.168.1.100:11434',
            defaultModel: 'phi3',
        }

        await updateProviderConfig(AIProviderType.OLLAMA, newConfig)
        const config = await getProviderConfig(AIProviderType.OLLAMA)

        expect(config).toEqual(newConfig)
    })

    it('should return default config if none set', async () => {
        const config = await getProviderConfig(AIProviderType.OLLAMA)
        expect(config).toEqual(OLLAMA_DEFAULTS)
    })

    it('should throw for unknown provider', async () => {
        await expect(setProviderEnabled('unknown', true)).rejects.toThrow('Unknown provider')
    })
})
