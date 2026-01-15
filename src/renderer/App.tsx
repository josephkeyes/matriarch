import { ThemeProvider, useThemeContext } from './contexts/ThemeContext'
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
    FloatingActionButton
} from './components/ui'

// Navigation items for header
const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'mindmaps', label: 'Mind Maps' },
    { id: 'explore', label: 'Explore' },
    { id: 'tasks', label: 'Tasks' },
]

// Demo activity data
const activityData = [30, 60, 40, 90, 70, 20, 50]

function AppContent() {
    const { toggleTheme, resolvedTheme } = useThemeContext()

    return (
        <AppShell
            header={
                <Header
                    navigation={<HeaderNav items={navItems} activeItem="dashboard" />}
                    actions={<HeaderActions />}
                />
            }
            sidebar={
                <Sidebar title="MAIN NAVIGATION">
                    <SidebarSection title="CORE AREAS">
                        <NavItem icon="dashboard" label="Dashboard" isActive />
                        <NavItem icon="layers" label="Collections" />
                        <NavItem icon="folder" label="Project Notes" level={1} />
                        <NavItem icon="folder" label="Research Archives" level={1} />
                        <NavItem icon="folder" label="Daily Logs" level={1} />
                        <NavItem icon="task_alt" label="Tasks" />
                    </SidebarSection>

                    <SidebarSection title="GLOBAL TAGS">
                        <div className="flex flex-wrap gap-2 px-2">
                            <Tag variant="default">#active</Tag>
                            <Tag variant="active">#priority</Tag>
                            <Tag variant="default">#draft</Tag>
                        </div>
                    </SidebarSection>

                    <SidebarSection title="EXPLORE & HISTORY">
                        <NavItem icon="insights" label="Visualizations" />
                        <NavItem icon="history" label="Recent Activity" />
                    </SidebarSection>
                </Sidebar>
            }
            rightPanel={
                <RightPanel>
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
                    <Button variant="primary">
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
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 h-48 flex items-center justify-center text-slate-400">
                        Collection cards will go here
                    </div>
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 h-48 flex items-center justify-center text-slate-400">
                        Collection cards will go here
                    </div>
                </div>
            </div>

            <FloatingActionButton />
        </AppShell>
    )
}

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    )
}

export default App

