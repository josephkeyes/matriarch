import { useState, useCallback } from 'react'
import { CommandPaletteProvider } from './contexts/CommandPaletteContext'
import { AppProviders } from './contexts/AppProviders'
import { MainLayout } from './components/layout/MainLayout'
import { Button, Modal, CommandPalette } from './components/ui'
import { NoteView } from './components/NoteView'
import { SettingsView } from './components/SettingsView'
import { DashboardView } from './components/DashboardView'
import { useAppNavigation } from './hooks/useAppNavigation'
import { useCollectionManager } from './hooks/useCollectionManager'

function AppContent() {
    const {
        activeView,
        activeNoteId,
        navigateToDashboard,
        navigateToNote,
        handleHeaderNav
    } = useAppNavigation()

    const {
        collections,
        createCollection,
        renameCollection,
        deleteCollection,
        loadCollections
    } = useCollectionManager()

    // Local UI State for Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newCollectionName, setNewCollectionName] = useState('')

    // Rename state
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
    const [collectionToRename, setCollectionToRename] = useState<{ id: string, name: string } | null>(null)
    const [renameValue, setRenameValue] = useState('')

    // Modal Handlers
    const handleCreateCollection = async () => {
        const success = await createCollection(newCollectionName)
        if (success) {
            setNewCollectionName('')
            setIsCreateModalOpen(false)
        }
    }

    const handleRenameCollection = async () => {
        if (!collectionToRename) return
        const success = await renameCollection(collectionToRename.id, renameValue)
        if (success) {
            setIsRenameModalOpen(false)
            setCollectionToRename(null)
        }
    }

    const handleDeleteCollection = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete the collection "${name}"?`)) {
            await deleteCollection(id)
        }
    }

    const handleCreateNote = async (collectionId?: string) => {
        // Todo: Implement direct note creation
        if (window.matriarch?.notes && collectionId) {
            try {
                const note = await window.matriarch.notes.create({
                    title: 'New Note',
                    collectionId: collectionId
                })
                console.log('Created note:', note)
                navigateToNote(note.id)
                await loadCollections() // Refresh tree
            } catch (e) {
                console.error('Failed to create note:', e)
            }
        } else {
            // Fallback to opening collection modal if generic create
            setIsCreateModalOpen(true)
        }
    }

    return (
        <MainLayout
            activeView={activeView}
            activeNoteId={activeNoteId}
            collections={collections}
            onNavigate={handleHeaderNav}
            onCreateCollection={() => setIsCreateModalOpen(true)}
            onCreateNote={handleCreateNote}
            onRenameCollection={(id, name) => {
                setCollectionToRename({ id, name })
                setRenameValue(name)
                setIsRenameModalOpen(true)
            }}
            onDeleteCollection={handleDeleteCollection}
        >
            {activeView === 'dashboard' && (
                <DashboardView onCreateCollection={() => setIsCreateModalOpen(true)} />
            )}

            {activeView === 'settings' && (
                <SettingsView onClose={navigateToDashboard} />
            )}

            {activeView === 'note' && activeNoteId && (
                <NoteView noteId={activeNoteId} onNoteUpdate={loadCollections} />
            )}

            {/* Modals */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Collection"
                description="Give your new collection a name to get started."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
                            Create Collection
                        </Button>
                    </>
                }
            >
                <div>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="e.g., Research Project"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                        autoFocus
                    />
                </div>
            </Modal>

            <Modal
                isOpen={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                title="Rename Collection"
                description="Enter a new name for your collection."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsRenameModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleRenameCollection} disabled={!renameValue.trim()}>
                            Save Changes
                        </Button>
                    </>
                }
            >
                <div>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Collection Name"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameCollection()}
                        autoFocus
                    />
                </div>
            </Modal>
        </MainLayout>
    )
}

function App() {
    // Command execution callback for handling navigation and toggle commands
    const handleCommandExecuted = useCallback((commandId: string, output: unknown) => {
        const action = output as { action?: string; route?: string; params?: { action?: string } }

        if (action?.action === 'navigate' && action?.route) {
            // Handle navigation commands
            if (action.route === 'dashboard') {
                window.dispatchEvent(new CustomEvent('matriarch:navigate', { detail: { view: 'dashboard' } }))
            } else if (action.route === 'settings') {
                window.dispatchEvent(new CustomEvent('matriarch:navigate', { detail: { view: 'settings' } }))
            }
        } else if (action?.action === 'toggle' || action?.action === 'execute') {
            const param = action?.params?.action
            if (param === 'toggle-theme') {
                window.dispatchEvent(new CustomEvent('matriarch:toggle-theme'))
            } else if (param === 'toggle-left-sidebar') {
                window.dispatchEvent(new CustomEvent('matriarch:toggle-left-sidebar'))
            } else if (param === 'toggle-right-sidebar') {
                window.dispatchEvent(new CustomEvent('matriarch:toggle-right-sidebar'))
            } else if (param === 'create-collection') {
                window.dispatchEvent(new CustomEvent('matriarch:create-collection'))
            } else if (param === 'create-note') {
                window.dispatchEvent(new CustomEvent('matriarch:create-note'))
            }
        }
    }, [])

    const handleNavigateToSettings = useCallback(() => {
        window.dispatchEvent(new CustomEvent('matriarch:navigate', { detail: { view: 'settings' } }))
    }, [])

    return (
        <AppProviders>
            <CommandPaletteProvider
                onNavigateToSettings={handleNavigateToSettings}
                onCommandExecuted={handleCommandExecuted}
            >
                <AppContent />
                <CommandPalette />
            </CommandPaletteProvider>
        </AppProviders>
    )
}

export default App

