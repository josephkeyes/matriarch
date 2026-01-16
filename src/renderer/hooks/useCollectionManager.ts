import { useState, useCallback, useEffect } from 'react'

export function useCollectionManager() {
    const [collections, setCollections] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadCollections = useCallback(async () => {
        if (!window.matriarch?.collections) {
            console.warn("Matriarch API not ready.")
            return
        }

        setIsLoading(true)
        try {
            const list = await window.matriarch.collections.list()
            setCollections(list)
            setError(null)
        } catch (err) {
            console.error("Failed to load collections:", err)
            setError("Failed to load collections")
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createCollection = useCallback(async (name: string) => {
        if (!name.trim()) return

        if (window.matriarch?.collections) {
            try {
                await window.matriarch.collections.create(name)
                await loadCollections()
                return true
            } catch (e) {
                console.error("Failed to create collection:", e)
                setError("Failed to create collection")
                return false
            }
        }
        return false
    }, [loadCollections])

    const renameCollection = useCallback(async (id: string, name: string) => {
        if (!name.trim()) return

        if (window.matriarch?.collections) {
            try {
                await window.matriarch.collections.update(id, { name })
                await loadCollections()
                return true
            } catch (e) {
                console.error("Failed to rename collection:", e)
                setError("Failed to rename collection")
                return false
            }
        }
        return false
    }, [loadCollections])

    const deleteCollection = useCallback(async (id: string) => {
        if (window.matriarch?.collections) {
            try {
                await window.matriarch.collections.delete(id)
                await loadCollections()
                return true
            } catch (e) {
                console.error("Failed to delete collection:", e)
                setError("Failed to delete collection")
                return false
            }
        }
        return false
    }, [loadCollections])

    // Initial load
    useEffect(() => {
        loadCollections()
    }, [loadCollections])

    return {
        collections,
        isLoading,
        error,
        loadCollections,
        createCollection,
        renameCollection,
        deleteCollection
    }
}
