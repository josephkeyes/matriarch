/**
 * useEventSubscription Hook
 * 
 * Automatically manages subscription and cleanup for EventBus events.
 * Ensures type safety and prevents memory leaks.
 */

import { useEffect, useRef } from 'react'
import { events, type AppEvents } from '../services/EventBus'

export function useEventSubscription<K extends keyof AppEvents>(
    event: K,
    handler: (payload: AppEvents[K]) => void
) {
    // Keep handler ref stable to avoid re-subscribing when handler function changes
    const handlerRef = useRef(handler)

    useEffect(() => {
        handlerRef.current = handler
    }, [handler])

    useEffect(() => {
        const listener = (payload: AppEvents[K]) => {
            handlerRef.current(payload)
        }

        events.on(event, listener)

        return () => {
            events.off(event, listener)
        }
    }, [event])
}
