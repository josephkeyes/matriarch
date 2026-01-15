import { useState, useEffect } from 'react'
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext'
import { ContextMenuProvider, useContextMenu } from './contexts/ContextMenuContext'
import {
    AppShell,
    Header,
    HeaderNav,
    HeaderActions,
    Sidebar,
    SidebarSection,
    RightPanel,
    InsightsSection,
    TasksSection,
    ActivitySection,
    TaskItem
} from './components/layout'
import {
    Button,
    NavItem,
    Tag,
    StatCard,
    FloatingActionButton,
    Modal
} from './components/ui'
import { NoteView } from './components/NoteView'
import { SettingsView } from './components/SettingsView'

// Navigation items for header
const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'mindmaps', label: 'Mind Maps' },
    { id: 'explore', label: 'Explore' },
    { id: 'settings', label: 'Settings' },
]

// Demo activity data
const activityData = [30, 60, 40, 90, 70, 20, 50]

function AppContent() {
    const { toggleTheme, resolvedTheme } = useThemeContext()
    const { showContextMenu } = useContextMenu()

    const [collections, setCollections] = useState<any[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newCollectionName, setNewCollectionName] = useState('')

    // Navigation State
    const [activeView, setActiveView] = useState<'dashboard' | 'note' | 'settings'>('dashboard')
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null)

    // UI Layout State
    const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false)
    const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false)

    // Rename state
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
    const [collectionToRename, setCollectionToRename] = useState<{ id: string, name: string } | null>(null)
    const [renameValue, setRenameValue] = useState('')

    useEffect(() => {
        loadCollections()
    }, [])

    const loadCollections = async () => {
        if (window.matriarch?.collections) {
            try {
                const list = await window.matriarch.collections.list()
                setCollections(list)
            } catch (err) {
                console.error("Failed to load collections:", err)
            }
        } else {
            console.warn("Matriarch API not ready.")
        }
    }

    const handleNavigateToNote = (noteId: string) => {
        setActiveNoteId(noteId)
        setActiveView('note')
    }

    const handleNavigateToDashboard = () => {
        setActiveView('dashboard')
        setActiveNoteId(null)
    }

    const handleNavigateToSettings = () => {
        setActiveView('settings')
        setActiveNoteId(null)
    }

    const handleHeaderNav = (id: string) => {
        if (id === 'dashboard') {
            handleNavigateToDashboard()
        } else if (id === 'settings') {
            handleNavigateToSettings()
        }
        // Other nav items (mindmaps, explore) not yet implemented
    }

    const handleCreateCollection = async () => {
        console.log("Attempting to create collection:", newCollectionName)
        if (!newCollectionName.trim()) {
            console.log("Collection name is empty")
            return
        }

        if (window.matriarch?.collections) {
            console.log("API found, sending create request...")
            try {
                const result = await window.matriarch.collections.create(newCollectionName)
                console.log("Collection created result:", result)
                await loadCollections()
                setNewCollectionName('')
                setIsCreateModalOpen(false)
            } catch (e) {
                console.error("Failed to create collection:", e)
            }
        } else {
            console.error("window.matriarch.collections is undefined!")
            alert("Internal Error: API is not connected. Check console logs.")
        }
    }

    const handleRenameCollection = async () => {
        if (!collectionToRename || !renameValue.trim()) return

        if (window.matriarch?.collections) {
            try {
                await window.matriarch.collections.update(collectionToRename.id, { name: renameValue })
                await loadCollections()
                setIsRenameModalOpen(false)
                setCollectionToRename(null)
            } catch (e) {
                console.error("Failed to rename collection:", e)
                alert("Failed to rename collection")
            }
        }
    }

    const handleDeleteCollection = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete the collection "${name}"?`)) {
            try {
                await window.matriarch.collections.delete(id)
                await loadCollections()
            } catch (e) {
                console.error("Failed to delete collection:", e)
                alert("Failed to delete collection")
            }
        }
    }

    const handleCollectionContextMenu = (e: React.MouseEvent, id: string, name: string) => {
        showContextMenu(e, [
            {
                label: 'Create Note',
                icon: 'note_add',
                action: async () => {
                    if (window.matriarch?.notes) {
                        try {
                            const note = await window.matriarch.notes.create({
                                title: 'New Note', // Todo: Prompt for name or use default
                                collectionId: id
                            })
                            console.log('Created note in collection:', note)
                            // Todo: Navigate to note or refresh list
                        } catch (e) {
                            console.error('Failed to create note:', e)
                        }
                    }
                }
            },
            {
                label: 'Rename Collection',
                icon: 'edit',
                action: () => {
                    setCollectionToRename({ id, name })
                    setRenameValue(name)
                    setIsRenameModalOpen(true)
                }
            },
            {
                label: 'Delete Collection',
                icon: 'delete',
                variant: 'danger',
                action: () => handleDeleteCollection(id, name)
            }
        ])
    }


    const openCreateModal = () => setIsCreateModalOpen(true)

    const handleCollectionsHeaderContextMenu = (e: React.MouseEvent) => {
        showContextMenu(e, [
            {
                label: 'Create Collection',
                icon: 'add_circle_outline',
                action: openCreateModal
            }
        ])
    }

    return (
        <AppShell
            header={
                <Header
                    navigation={
                        <HeaderNav
                            items={navItems}
                            activeItem={activeView === 'settings' ? 'settings' : 'dashboard'}
                            onNavigate={handleHeaderNav}
                        />
                    }
                    actions={
                        <div className="flex items-center space-x-3">
                            <Button variant="primary" onClick={openCreateModal}>
                                <span className="material-icons-round text-xs mr-1">add</span>
                                New Collection
                            </Button>
                            <HeaderActions />
                        </div>
                    }
                />
            }
            sidebar={
                <Sidebar
                    title="MAIN NAVIGATION"
                    onCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
                    isCollapsed={isLeftSidebarCollapsed}
                >
                    <div className={isLeftSidebarCollapsed ? "px-2 mb-4 flex justify-center" : "px-4 mb-4"}>
                        <Button
                            variant="secondary"
                            size="sm"
                            className={isLeftSidebarCollapsed ? "w-8 h-8 p-0 justify-center" : "w-full justify-start"}
                            onClick={openCreateModal}
                            title="Add Collection"
                        >
                            <span className={isLeftSidebarCollapsed ? "material-icons-round text-xs" : "material-icons-round text-xs mr-2"}>add</span>
                            {!isLeftSidebarCollapsed && "Add Collection"}
                        </Button>
                    </div>

                    <SidebarSection title="CORE AREAS" isCollapsed={isLeftSidebarCollapsed}>
                        <NavItem
                            icon="dashboard"
                            label="Dashboard"
                            isActive={activeView === 'dashboard'}
                            onClick={handleNavigateToDashboard}
                            collapsed={isLeftSidebarCollapsed}
                        />

                        {collections.length > 0 && (
                            <>
                                <NavItem
                                    icon="layers"
                                    label="Collections"
                                    onContextMenu={handleCollectionsHeaderContextMenu}
                                    collapsed={isLeftSidebarCollapsed}
                                />
                                {collections.map(c => (
                                    <NavItem
                                        key={c.id}
                                        icon="folder"
                                        label={c.name}
                                        level={0}
                                        onContextMenu={(e) => handleCollectionContextMenu(e, c.id, c.name)}
                                        collapsed={isLeftSidebarCollapsed}
                                    >
                                        {/* Render nested notes from placements */}
                                        {c.placements?.map((p: any) => (
                                            <NavItem
                                                key={p.note.id}
                                                icon="description"
                                                label={p.note.title}
                                                level={1}
                                                isActive={activeView === 'note' && activeNoteId === p.note.id}
                                                onClick={() => handleNavigateToNote(p.note.id)}
                                                collapsed={isLeftSidebarCollapsed}
                                            />
                                        ))}
                                        {(!c.placements || c.placements.length === 0) && (
                                            <div className="pl-9 pr-2 py-1.5 text-xs text-slate-400 italic cursor-default">
                                                No notes
                                            </div>
                                        )}
                                    </NavItem>
                                ))}
                            </>
                        )}

                        <NavItem icon="task_alt" label="Tasks" collapsed={isLeftSidebarCollapsed} />
                    </SidebarSection>

                    <SidebarSection title="GLOBAL TAGS" isCollapsed={isLeftSidebarCollapsed}>
                        {isLeftSidebarCollapsed ? (
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] text-slate-400">#</span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 px-2">
                                <Tag variant="default">#active</Tag>
                                <Tag variant="active">#priority</Tag>
                                <Tag variant="default">#draft</Tag>
                            </div>
                        )}
                    </SidebarSection>

                    <SidebarSection title="EXPLORE & HISTORY" isCollapsed={isLeftSidebarCollapsed}>
                        <NavItem icon="insights" label="Visualizations" collapsed={isLeftSidebarCollapsed} />
                        <NavItem icon="history" label="Recent Activity" collapsed={isLeftSidebarCollapsed} />
                    </SidebarSection>
                </Sidebar>
            }
            rightPanel={
                <RightPanel
                    onCollapse={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
                    isCollapsed={isRightSidebarCollapsed}
                >
                    <InsightsSection>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <StatCard
                                label="TOTAL NOTES"
                                value="1,248"
                                change="+12 this week"
                                changeColor="green"
                            />
                            <StatCard
                                label="CONNECTIONS"
                                value="4,821"
                                change="Avg 3.8/note"
                                changeColor="primary"
                            />
                        </div>

                        <div className="flex-1 flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 mb-2">
                                TOP COLLECTION TRENDS
                            </span>
                            <div className="flex-1 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark flex items-center justify-center">
                                <div className="text-center">
                                    <span className="material-icons-round text-primary text-4xl mb-2">
                                        auto_graph
                                    </span>
                                    <p className="text-xs text-slate-500">Research Archives up 24%</p>
                                </div>
                            </div>
                        </div>
                    </InsightsSection>

                    <TasksSection count={8}>
                        <TaskItem label="Review loci technique notes" />
                        <TaskItem label="Export project summary" />
                        <TaskItem label="Clean up untagged logs" />
                        <ActivitySection
                            period="SEPTEMBER"
                            data={activityData}
                        />
                    </TasksSection>
                </RightPanel>
            }
        >
            {/* Main Content Area */}
            {activeView === 'settings' ? (
                <SettingsView onClose={handleNavigateToDashboard} />
            ) : activeView === 'note' && activeNoteId ? (
                <NoteView noteId={activeNoteId} onNoteUpdate={loadCollections} />
            ) : (
                <>
                    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-border-dark/50 sticky top-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md z-40">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-text-main-dark">
                                Knowledge Hub
                            </h1>
                            <div className="h-6 w-px bg-slate-200 dark:bg-border-dark mx-2" />
                            <nav className="flex space-x-4 text-sm font-medium text-slate-500">
                                <span className="text-primary border-b-2 border-primary pb-4 -mb-4">Collections</span>
                                <span className="hover:text-primary cursor-pointer pb-4 -mb-4">All Notes</span>
                                <span className="hover:text-primary cursor-pointer pb-4 -mb-4">Visualization</span>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                <span className="material-icons-round">
                                    {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
                                </span>
                            </Button>
                            <Button variant="primary" onClick={openCreateModal}>
                                <span className="material-icons-round text-xs mr-1">add</span>
                                New Collection
                            </Button>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto w-full py-10 px-8">
                        <header className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-text-main-dark mb-2">
                                Note Collections
                            </h2>
                            <p className="text-slate-500 text-sm">
                                Organize and manage your specialized knowledge bases.
                            </p>
                        </header>

                        {/* Placeholder for collection cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 h-48 flex items-center justify-center text-slate-400">
                                Collection cards will go here
                            </div>
                        </div>
                    </div>

                    <FloatingActionButton />

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

                    {/* Rename Collection Modal */}
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
                </>
            )}
        </AppShell>
    )
}

function App() {
    return (
        <ThemeProvider>
            <ContextMenuProvider>
                <AppContent />
            </ContextMenuProvider>
        </ThemeProvider>
    )
}

export default App
