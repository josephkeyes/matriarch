import { createClient, type Client } from '@libsql/client'
import path from 'node:path'
import { app } from 'electron'

export class DatabaseClient {
    private static instance: DatabaseClient
    private client: Client

    private constructor() {
        const dbPath = path.join(app.getPath('userData'), 'matriarch.db')
        // We utilize the strict Turso compliant driver
        this.client = createClient({
            url: `file:${dbPath}`,
        })

        this.initializeSchema()
    }

    public static getInstance(): DatabaseClient {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new DatabaseClient()
        }
        return DatabaseClient.instance
    }

    private async initializeSchema() {
        // Basic schema initialization stub
        // In future this will run migrations
        try {
            await this.client.execute(`
        CREATE TABLE IF NOT EXISTS system_meta (
          key TEXT PRIMARY KEY,
          value TEXT,
          created_at INTEGER DEFAULT (unixepoch())
        )
      `)
        } catch (e) {
            console.error('Schema initialization failed', e)
        }
    }

    public getClient(): Client {
        return this.client
    }
}
