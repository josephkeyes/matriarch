import { useEffect } from 'react'

export function LegacyEventListeners({
    onCreateCollection,
    onCreateNote
}: {
    onCreateCollection: () => void,
    onCreateNote: () => void
}) {
    useEffect(() => {
        const handleCreateCollection = () => onCreateCollection()
        const handleCreateNote = () => onCreateNote()

        window.addEventListener('matriarch:create-collection', handleCreateCollection)
        window.addEventListener('matriarch:create-note', handleCreateNote)

        return () => {
            window.removeEventListener('matriarch:create-collection', handleCreateCollection)
            window.removeEventListener('matriarch:create-note', handleCreateNote)
        }
    }, [onCreateCollection, onCreateNote])

    return null
}
