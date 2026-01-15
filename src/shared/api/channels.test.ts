/**
 * API Channels Tests
 * 
 * Validates the IPC channel constants used for renderer-main communication.
 * Ensures type safety and consistency of the channel layer.
 * 
 * @see Phase-0 §8.1 - Internal API Layer
 */

import { describe, it, expect } from 'vitest'
import { CHANNELS, type Channel } from './channels'

describe('API Channels', () => {
    describe('Structure', () => {
        it('should export CHANNELS object', () => {
            expect(CHANNELS).toBeDefined()
            expect(typeof CHANNELS).toBe('object')
        })

        it('should have SYSTEM namespace', () => {
            expect(CHANNELS.SYSTEM).toBeDefined()
            expect(typeof CHANNELS.SYSTEM).toBe('object')
        })

        it('should have HEALTH channel under SYSTEM', () => {
            expect(CHANNELS.SYSTEM.HEALTH).toBeDefined()
            expect(typeof CHANNELS.SYSTEM.HEALTH).toBe('string')
        })
    })

    describe('Channel Naming Conventions', () => {
        it('should use colon-separated namespace:action format', () => {
            // All channels should follow the pattern "namespace:action"
            const channelPattern = /^[a-z]+:[a-z]+$/

            expect(CHANNELS.SYSTEM.HEALTH).toMatch(channelPattern)
        })

        it('should have expected SYSTEM.HEALTH value', () => {
            expect(CHANNELS.SYSTEM.HEALTH).toBe('system:health')
        })
    })

    describe('Channel Uniqueness', () => {
        it('should have no duplicate channel values', () => {
            // Flatten all channel values into an array
            const allChannels: string[] = []

            function collectChannels(obj: Record<string, unknown>, channels: string[]): void {
                for (const value of Object.values(obj)) {
                    if (typeof value === 'string') {
                        channels.push(value)
                    } else if (typeof value === 'object' && value !== null) {
                        collectChannels(value as Record<string, unknown>, channels)
                    }
                }
            }

            collectChannels(CHANNELS, allChannels)

            // Check for duplicates
            const uniqueChannels = new Set(allChannels)
            expect(uniqueChannels.size).toBe(allChannels.length)
        })
    })

    describe('Type Exports', () => {
        it('should export Channel type', () => {
            // This is a compile-time check - if Channel type doesn't exist,
            // TypeScript will fail to compile this test file
            const channelType: Channel = CHANNELS
            expect(channelType).toBe(CHANNELS)
        })
    })
})
