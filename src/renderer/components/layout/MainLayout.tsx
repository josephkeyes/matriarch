import React, { useState } from 'react'
import { useThemeContext } from '../../contexts/ThemeContext'
import { useContextMenu } from '../../contexts/ContextMenuContext'
import { useLayoutContext } from '../../contexts/LayoutContext'
import { ViewType } from '../../contexts/NavigationContext'
import { useCommandPalette } from '../../contexts/CommandPaletteContext'
import { cn } from '../../lib/cn'
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
} from '../layout'
import {
    Button,
    NavItem,
    Tag,
    StatCard,
    CommandPaletteButton,
    SearchInput
} from '../ui'

// Navigation items needed for HeaderNav
const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'mindmaps', label: 'Mind Maps' },
    { id: 'explore', label: 'Explore' },
    { id: 'settings', label: 'Settings' },
]

// Demo activity data
const activityData = [30, 60, 40, 90, 70, 20, 50]

interface MainLayoutProps {
    children: React.ReactNode
    activeView: ViewType
    activeNoteId: string | null
    collections: any[]

    // Actions
    onNavigate: (id: string, noteId?: string | null) => void // Generalized navigation
    onCreateCollection: () => void
    onCreateNote: (collectionId?: string) => void
    onRenameCollection: (id: string, name: string) => void
    onDeleteCollection: (id: string, name: string) => void
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    activeView,
    activeNoteId,
    collections,
    onNavigate,
    onCreateCollection,
    onCreateNote,
    onRenameCollection,
    onDeleteCollection
}) => {
    const { toggleTheme, resolvedTheme } = useThemeContext()
    const { showContextMenu } = useContextMenu()
    const { toggle: toggleCommandPalette } = useCommandPalette()

    const {
        isLeftSidebarCollapsed,
        toggleLeftSidebar,
        isRightSidebarCollapsed,
        toggleRightSidebar
    } = useLayoutContext()

    // Context Menu Handlers
    const handleCollectionsHeaderContextMenu = (e: React.MouseEvent) => {
        showContextMenu(e, [
            {
                label: 'Create Collection',
                icon: 'create_new_folder',
                action: onCreateCollection
            }
        ])
    }

    const handleCollectionContextMenu = (e: React.MouseEvent, id: string, name: string) => {
        showContextMenu(e, [
            {
                label: 'Create Note',
                icon: 'note_add',
                action: async () => onCreateNote(id)
            },
            {
                label: 'Rename Collection',
                icon: 'edit',
                action: () => onRenameCollection(id, name)
            },
            {
                label: 'Delete Collection',
                icon: 'delete',
                variant: 'danger',
                action: () => onDeleteCollection(id, name)
            }
        ])
    }

    // Header Navigation Wrapper
    const handleHeaderNav = (id: string) => {
        onNavigate(id)
    }

    // Custom Sidebar Header for Expanded State
    const ExpandedSidebarHeader = (
        <div className="flex flex-col gap-2 p-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-text-main-dark"
                        onClick={onCreateCollection}
                        title="New Collection"
                    >
                        <span className="material-icons-round text-[20px]">create_new_folder</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-text-main-dark"
                        onClick={() => onCreateNote()}
                        title="New Note"
                    >
                        <span className="material-icons-round text-[20px]">note_add</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-text-main-dark"
                        onClick={toggleCommandPalette}
                        title="Command Palette"
                    >
                        <span className="material-icons-round text-[20px]">terminal</span>
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-text-main-dark p-0.5"
                    onClick={toggleLeftSidebar}
                    title="Collapse Sidebar"
                >
                    <span className="material-icons-round text-lg">keyboard_double_arrow_left</span>
                </Button>
            </div>
            <SearchInput
                placeholder="Search knowledge..."
                className="bg-slate-50 dark:bg-background-dark/50"
            />
        </div>
    )

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
                            <HeaderActions
                                onThemeToggle={toggleTheme}
                                resolvedTheme={resolvedTheme}
                                onSettingsClick={() => onNavigate('settings')}
                            />
                        </div>
                    }
                />
            }
            sidebar={
                <Sidebar
                    header={!isLeftSidebarCollapsed ? ExpandedSidebarHeader : undefined}
                    onCollapse={toggleLeftSidebar}
                    isCollapsed={isLeftSidebarCollapsed}
                >
                    {/* Collapsed State Icons (Hidden when expanded) */}
                    {isLeftSidebarCollapsed && (
                        <div className="flex flex-col items-center gap-3 px-2 mb-6 pt-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-text-main-dark"
                                onClick={onCreateCollection}
                                title="New Collection"
                            >
                                <span className="material-icons-round text-[20px]">create_new_folder</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-text-main-dark"
                                onClick={() => onCreateNote()}
                                title="New Note"
                            >
                                <span className="material-icons-round text-[20px]">note_add</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-text-main-dark"
                                onClick={toggleCommandPalette}
                                title="Command Palette"
                            >
                                <span className="material-icons-round text-[20px]">terminal</span>
                            </Button>
                        </div>
                    )}

                    <SidebarSection title="CORE AREAS" isCollapsed={isLeftSidebarCollapsed}>
                        <NavItem
                            icon="dashboard"
                            label="Dashboard"
                            isActive={activeView === 'dashboard'}
                            onClick={() => onNavigate('dashboard')}
                            collapsed={isLeftSidebarCollapsed}
                        />

                        {collections.length > 0 && (
                            <NavItem
                                icon="layers"
                                label="Collections"
                                onContextMenu={handleCollectionsHeaderContextMenu}
                                collapsed={isLeftSidebarCollapsed}
                            >
                                {collections.map(c => (
                                    <NavItem
                                        key={c.id}
                                        icon="folder"
                                        label={c.name}
                                        level={1}
                                        onContextMenu={(e) => handleCollectionContextMenu(e, c.id, c.name)}
                                        collapsed={isLeftSidebarCollapsed}
                                    >
                                        {c.placements?.map((p: any) => (
                                            <NavItem
                                                key={p.note.id}
                                                icon="description"
                                                label={p.note.title}
                                                level={2}
                                                isActive={activeView === 'note' && activeNoteId === p.note.id}
                                                onClick={() => onNavigate('note', p.note.id)}
                                                collapsed={isLeftSidebarCollapsed}
                                            />
                                        ))}
                                        {(!c.placements || c.placements.length === 0) && (
                                            <div className="pl-[42px] pr-2 py-1.5 text-xs text-slate-400 italic cursor-default">
                                                No notes
                                            </div>
                                        )}
                                    </NavItem>
                                ))}
                            </NavItem>
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
                    onCollapse={toggleRightSidebar}
                    isCollapsed={isRightSidebarCollapsed}
                >
                    <InsightsSection>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <StatCard
                                label="TOTAL NOTES"
                                value="1,248" // Todo: Real stats
                                change="+12 this week"
                                changeColor="green"
                            />
                            <StatCard
                                label="CONNECTIONS"
                                value="4,821" // Todo: Real stats
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
            {children}
        </AppShell>
    )
}
