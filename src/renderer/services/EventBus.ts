/**
 * Event Bus Service
 * 
 * A strongly-typed event emitter for system-wide communication.
 * Decouples components and replaces legacy window.dispatchEvent.
 */

type AppEvents = {
    // Navigation
    'navigation:request': { view: 'dashboard' | 'settings' | 'note'; noteId?: string };

    // Core Actions
    'collection:create-requested': void;
    'note:create-requested': { collectionId?: string };

    // System
    'app:ready': void;
}

type EventHandler<T> = (payload: T) => void;

class EventBus {
    private static instance: EventBus;
    private listeners: Map<keyof AppEvents, Set<EventHandler<any>>> = new Map();

    private constructor() { }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public on<K extends keyof AppEvents>(event: K, handler: EventHandler<AppEvents[K]>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler);
    }

    public off<K extends keyof AppEvents>(event: K, handler: EventHandler<AppEvents[K]>): void {
        this.listeners.get(event)?.delete(handler);
    }

    public emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]): void {
        console.debug(`[EventBus] Emitting ${event}`, payload);
        this.listeners.get(event)?.forEach(handler => {
            try {
                handler(payload);
            } catch (error) {
                console.error(`[EventBus] Error in handler for ${event}:`, error);
            }
        });
    }
}

export const events = EventBus.getInstance();
