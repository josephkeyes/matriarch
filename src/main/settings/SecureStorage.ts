/**
 * Secure Storage
 * 
 * Wrapper around Electron's safeStorage API for storing sensitive data
 * like API keys and tokens in the OS keychain.
 * 
 * - macOS: Keychain
 * - Windows: Credential Store  
 * - Linux: Secret Service API
 */

import { safeStorage } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

// Directory for storing encrypted secrets
const getSecretsDir = () => path.join(app.getPath('userData'), 'secrets')

// Ensure secrets directory exists
function ensureSecretsDir(): void {
    const dir = getSecretsDir()
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

// Get path for a specific secret file
function getSecretPath(key: string): string {
    // Sanitize key to be a valid filename
    const sanitizedKey = key.replace(/[^a-zA-Z0-9._-]/g, '_')
    return path.join(getSecretsDir(), `${sanitizedKey}.enc`)
}

/**
 * Check if encryption is available on this system.
 * Should always be true on supported platforms.
 */
export function isEncryptionAvailable(): boolean {
    return safeStorage.isEncryptionAvailable()
}

/**
 * Store a secret value securely.
 * The value is encrypted before being written to disk.
 * 
 * @param key - Unique identifier for the secret
 * @param value - The secret value to store
 */
export function setSecret(key: string, value: string): void {
    if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption is not available on this system')
    }

    ensureSecretsDir()
    const encryptedBuffer = safeStorage.encryptString(value)
    fs.writeFileSync(getSecretPath(key), encryptedBuffer)
}

/**
 * Retrieve a secret value.
 * 
 * @param key - The unique identifier for the secret
 * @returns The decrypted secret value, or null if not found
 */
export function getSecret(key: string): string | null {
    const secretPath = getSecretPath(key)

    if (!fs.existsSync(secretPath)) {
        return null
    }

    if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption is not available on this system')
    }

    const encryptedBuffer = fs.readFileSync(secretPath)
    return safeStorage.decryptString(encryptedBuffer)
}

/**
 * Delete a stored secret.
 * 
 * @param key - The unique identifier for the secret to delete
 */
export function deleteSecret(key: string): void {
    const secretPath = getSecretPath(key)

    if (fs.existsSync(secretPath)) {
        fs.unlinkSync(secretPath)
    }
}

/**
 * Check if a secret exists.
 * 
 * @param key - The unique identifier to check
 */
export function hasSecret(key: string): boolean {
    return fs.existsSync(getSecretPath(key))
}

/**
 * List all stored secret keys (not values).
 */
export function listSecretKeys(): string[] {
    const dir = getSecretsDir()
    if (!fs.existsSync(dir)) {
        return []
    }

    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.enc'))
        .map(file => file.replace('.enc', ''))
}
