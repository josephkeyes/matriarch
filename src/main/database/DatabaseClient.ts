import { createClient } from '@libsql/client'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'node:path'
import { app } from 'electron'

export class DatabaseClient {
    private static instance: DatabaseClient
    private prisma: PrismaClient

    private constructor() {
        const dbPath = path.join(app.getPath('userData'), 'matriarch.db')

        const url = `file:${dbPath}`
        const libsql = createClient({
            url,
        })
        // Workaround: adapter expects url property
        Object.assign(libsql, { url })

        const adapter = new PrismaLibSql(libsql as any)
        this.prisma = new PrismaClient({ adapter })
    }

    public static getInstance(): DatabaseClient {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new DatabaseClient()
        }
        return DatabaseClient.instance
    }

    public async initialize() {
        try {
            console.log('Initializing database schema...')

            // Create tables if they don't exist
            // We use queryRaw/executeRaw for schema ops not managed by Migrations in this Phase-0 context
            // Note: In a real app we might use 'prisma migrate' or similar, but for now we mirror the existing logic.
            // Using executeRawUnsafe because we are passing static strings.
            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS system_meta (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    created_at INTEGER DEFAULT (unixepoch())
                )
            `)

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS startup_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event TEXT,
                    timestamp INTEGER
                )
            `)

            const timestamp = BigInt(Date.now())
            await this.prisma.startupEvent.create({
                data: {
                    event: 'startup',
                    timestamp: timestamp
                }
            })

            const record = await this.prisma.startupEvent.findFirst({
                where: {
                    timestamp: timestamp
                }
            })

            if (record) {
                console.log('Startup validation passed: Found record', record)
            } else {
                console.error('Startup validation failed: Record not found')
            }
        } catch (e) {
            console.error('Schema initialization failed', e)
            throw e
        }
    }

    public getClient(): PrismaClient {
        return this.prisma
    }
}
