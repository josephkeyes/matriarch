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
import { useCommandExecution } from './hooks/useCommandExecution'
import { LegacyEventListeners } from './components/LegacyEventListeners'

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

            {/* Listeners for legacy/bridge events */}
            <LegacyEventListeners
                onCreateCollection={() => setIsCreateModalOpen(true)}
                onCreateNote={handleCreateNote}
            />

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

// Main App Component that uses the hook
function AppRoot() {
    const {
        navigateToDashboard,
        navigateToSettings,
        navigateToNote,
    } = useAppNavigation()

    const {
        createCollection,
        loadCollections
    } = useCollectionManager()

    // Command execution callback
    // We pass handlers directly from our hooks
    const handleCommandExecuted = useCommandExecution(
        (id, noteId) => {
            if (id === 'dashboard') navigateToDashboard()
            else if (id === 'settings') navigateToSettings()
            else if (id === 'note' && noteId) navigateToNote(noteId)
        },
        () => window.dispatchEvent(new CustomEvent('matriarch:create-collection')), // Temporary bridge until we lift state
        () => window.dispatchEvent(new CustomEvent('matriarch:create-note'))      // Temporary bridge
    )

    // Note on CREATE handlers:
    // Since createCollection/createNote depend on Modal state which is inside AppContent,
    // we can't easily execute them at this level without lifting state.
    // For this refactor, we will keep the window events ONLY for the complex modal triggers 
    // (Create Collection, Create Note) but use direct context for Theme/Sidebar/Nav.
    // Ideally, we should lift modal state to a GlobalModalContext.

    const handleNavigateToSettings = useCallback(() => {
        navigateToSettings()
    }, [navigateToSettings])

    return (
        <CommandPaletteProvider
            onNavigateToSettings={handleNavigateToSettings}
            onCommandExecuted={handleCommandExecuted}
        >
            <AppContent />
            <CommandPalette />
        </CommandPaletteProvider>
    )
}

function App() {
    return (
        <AppProviders>
            <AppRoot />
        </AppProviders>
    )
}

export default App

