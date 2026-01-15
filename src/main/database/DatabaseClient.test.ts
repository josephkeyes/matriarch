import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DatabaseClient } from './DatabaseClient'
import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// Mock Electron app
vi.mock('electron', () => ({
    app: {
        getPath: vi.fn(),
    },
}))

describe('DatabaseClient', () => {
    let tempDir: string

    beforeEach(() => {
        // Create a temp directory for each test
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'matriarch-test-'))
        vi.mocked(app.getPath).mockReturnValue(tempDir)

        // Reset the singleton instance for isolation
        // @ts-ignore
        DatabaseClient.instance = undefined
    })

    afterEach(() => {
        // Cleanup temp dir
        try {
            fs.rmSync(tempDir, { recursive: true, force: true })
        } catch (e) {
            console.error('Failed to clean up temp dir', e)
        }
    })

    it('should be a singleton', () => {
        const instance1 = DatabaseClient.getInstance()
        const instance2 = DatabaseClient.getInstance()
        expect(instance1).toBe(instance2)
    })

    it('should initialize tables and perform startup validation', async () => {
        const db = DatabaseClient.getInstance()
        const spy = vi.spyOn(console, 'log')

        await db.initialize()

        // Check verification log
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Startup validation passed'), expect.anything())

        // Verify tables exist
        const client = db.getClient()
        // Use Prisma raw query to check tables
        const tables = await client.$queryRawUnsafe<any[]>("SELECT name FROM sqlite_master WHERE type='table'")

        const tableNames = tables.map((r: any) => r.name)
        expect(tableNames).toContain('system_meta')
        expect(tableNames).toContain('startup_events')
    })

    it('should persist data', async () => {
        const db = DatabaseClient.getInstance()
        await db.initialize()

        const client = db.getClient()
        // Verify we have at least one startup event (created during initialize)
        const result = await client.startupEvent.findMany()
        expect(result.length).toBeGreaterThan(0)
        expect(result[0].event).toBe('startup')
    })
})
