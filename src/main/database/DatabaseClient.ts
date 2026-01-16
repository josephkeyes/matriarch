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

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS system_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
                )
            `)

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS notes (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
                    updated_at DATETIME NOT NULL
                )
            `)

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS collections (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
                    updated_at DATETIME NOT NULL
                )
            `)

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS folders (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    collection_id TEXT NOT NULL,
                    parent_id TEXT,
                    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
                    updated_at DATETIME NOT NULL,
                    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
                    FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
                )
            `)

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS note_placements (
                    id TEXT PRIMARY KEY,
                    note_id TEXT NOT NULL,
                    collection_id TEXT NOT NULL,
                    folder_id TEXT,
                    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
                    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
                    UNIQUE(note_id, collection_id, folder_id)
                )
            `)

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS categories (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE
                )
            `)

            // m-n relation for categories-notes
            // Prisma implicit many-to-many uses a separate join table name usually '_CategoryToNote' or similar if not specified.
            // But I didn't specify @@map on the relation table, I let Prisma handle it?
            // Wait, in schema.prisma I defined `notes Note[]` and `Category`. This is an IMPLICIT m-n.
            // Prisma expects `_CategoryToNote` table with `A` and `B` columns.
            // I should probably make it EXPLICIT in schema to control the table name?
            // Or I can just create the table Prisma expects.
            // Let's create the implicit table `_CategoryToNote` (A=Category.id, B=Note.id).
            // Actually, for robustness, I should have defined an explicit join model in schema.
            // But for now I will create the standard Prisma convention table.
            // Table name: _CategoryToNote
            // Cols: A (references Category.id), B (references Note.id)

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "_CategoryToNote" (
                    "A" TEXT NOT NULL,
                    "B" TEXT NOT NULL,
                    FOREIGN KEY ("A") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                    FOREIGN KEY ("B") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
                )
            `)

            await this.prisma.$executeRawUnsafe(`
                CREATE UNIQUE INDEX IF NOT EXISTS "_CategoryToNote_AB_unique" ON "_CategoryToNote"("A", "B");
            `)

            await this.prisma.$executeRawUnsafe(`
                CREATE INDEX IF NOT EXISTS "_CategoryToNote_B_index" ON "_CategoryToNote"("B");
            `)

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS note_associations (
                    id TEXT PRIMARY KEY,
                    source_id TEXT NOT NULL,
                    target_id TEXT NOT NULL,
                    type TEXT,
                    metadata TEXT,
                    FOREIGN KEY (source_id) REFERENCES notes(id) ON DELETE CASCADE,
                    FOREIGN KEY (target_id) REFERENCES notes(id) ON DELETE CASCADE,
                    UNIQUE(source_id, target_id)
                )
            `)

            // AI Provider tables
            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS ai_providers (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    enabled INTEGER NOT NULL DEFAULT 0,
                    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
                    updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
                )
            `)

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS ai_provider_configs (
                    id TEXT PRIMARY KEY,
                    provider_id TEXT NOT NULL UNIQUE,
                    config_json TEXT NOT NULL,
                    FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE
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
