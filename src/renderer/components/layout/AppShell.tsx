import { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface AppShellProps {
    /** Header component */
    header?: ReactNode
    /** Left sidebar component */
    sidebar?: ReactNode
    /** Main content area */
    children: ReactNode
    /** Right panel component */
    rightPanel?: ReactNode
    /** Additional className for the main content area */
    className?: string
}

/**
 * Application shell component providing the main layout structure.
 * 
 * Layout:
 * - Fixed header at top (h-14)
 * - Optional collapsible sidebar on left
 * - Main content area (scrollable)
 * - Optional right panel for insights
 */
export function AppShell({
    header,
    sidebar,
    children,
    rightPanel,
    className
}: AppShellProps) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-text-main-dark overflow-hidden">
            {/* Header */}
            {header}

            {/* Main layout */}
            <main className="flex h-[calc(100vh-3.5rem)]">
                {/* Left Sidebar */}
                {sidebar}

                {/* Main Content Area */}
                <section className={cn(
                    'flex-1 flex flex-col overflow-y-auto custom-scrollbar',
                    'bg-white dark:bg-background-dark',
                    className
                )}>
                    {children}
                </section>

                {/* Temporarily removing this panel until we determine a better UI */}
                {/* Right Panel */}
                {/* {rightPanel} */}
            </main>
        </div>
    )
}
