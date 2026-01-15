
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { listCollections, createCollection, updateCollection, deleteCollection } from './collectionsApi'
import { DatabaseClient } from '../database/DatabaseClient'
import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// Mock Electron
vi.mock('electron', () => ({
    app: { getPath: vi.fn() },
    ipcMain: { handle: vi.fn() }
}))

describe('Collections API', () => {
    let tempDir: string

    beforeEach(async () => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'matriarch-test-api-'))
        vi.mocked(app.getPath).mockReturnValue(tempDir)
        // @ts-ignore
        DatabaseClient.instance = undefined
        await DatabaseClient.getInstance().initialize()
    })

    afterEach(() => {
        try { fs.rmSync(tempDir, { recursive: true, force: true }) } catch { }
    })

    it('should create and list collections', async () => {
        // Create
        const created = await createCollection('Test Collection')
        expect(created.name).toBe('Test Collection')
        expect(created.id).toBeDefined()

        // List
        const list = await listCollections()
        expect(list).toHaveLength(1)
        expect(list[0].name).toBe('Test Collection')
        expect(list[0].folders).toBeDefined()
    })

    it('should update and delete collections', async () => {
        // Create
        const created = await createCollection('To Be Deleted')
        expect(created.name).toBe('To Be Deleted')

        // Update
        const updated = await updateCollection(created.id, { name: 'Renamed' })
        expect(updated.name).toBe('Renamed')

        // Verify update in list
        const listAfterUpdate = await listCollections()
        expect(listAfterUpdate[0].name).toBe('Renamed')

        // Delete
        await deleteCollection(created.id)

        // Verify delete
        const listAfterDelete = await listCollections()
        expect(listAfterDelete).toHaveLength(0)
    })
})
