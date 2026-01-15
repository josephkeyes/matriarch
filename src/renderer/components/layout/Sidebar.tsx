import { ReactNode, useState, useEffect } from 'react'
import { cn } from '../../lib/cn'
import { SearchInput } from '../ui/SearchInput'
import { Button } from '../ui/Button'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import { Collection } from '../../../shared/api/contracts'

export interface SidebarProps {
    /** Sidebar title */
    title?: string
    /** Whether sidebar is collapsible */
    collapsible?: boolean
    /** Callback when collapse button is clicked */
    onCollapse?: () => void
    /** Search configuration */
    searchPlaceholder?: string
    onSearch?: (query: string) => void
    /** Sidebar content sections */
    children: ReactNode
    /** Additional className */
    className?: string
    /** Width variant */
    width?: 'narrow' | 'default' | 'wide'
}

/**
 * Left sidebar component with search and navigation sections.
 */
export function Sidebar({
    title = 'MAIN NAVIGATION',
    collapsible = true,
    onCollapse,
    searchPlaceholder = 'Search knowledge...',
    onSearch,
    children,
    className,
    width = 'default'
}: SidebarProps) {
    const widthClasses = {
        narrow: 'w-56',
        default: 'w-64',
        wide: 'w-72',
    }

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{
        x: number
        y: number
        items: ContextMenuItem[]
    } | null>(null)

    // Close context menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu(null)
        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [])

    return (
        <aside className={cn(
            widthClasses[width],
            'border-r border-slate-200 dark:border-border-dark',
            'flex flex-col',
            'bg-white dark:bg-surface-dark',
            'overflow-y-auto custom-scrollbar',
            className
        )}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-border-dark/50">
                <h2 className="font-semibold text-sm tracking-wide text-slate-900 dark:text-text-main-dark">
                    {title}
                </h2>
                {collapsible && (
                    <Button variant="ghost" size="icon" onClick={onCollapse} className="p-0.5">
                        <span className="material-icons-round text-slate-400 text-sm">
                            keyboard_double_arrow_left
                        </span>
                    </Button>
                )}
            </div>

            {/* Search */}
            <div className="p-4">
                <SearchInput
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearch?.(e.target.value)}
                />
            </div>

            {/* Navigation sections */}
            <div className="px-2 space-y-6 pb-6 flex-1">
                {/* 
                  We need to intercept the children to attach context menu listeners 
                  or expose a ContextProvider. For Phase-0 simplicity, we will assume 
                  children handle their own events or we wrap them.
                  
                  Actually, since 'children' is opaque here, we can't easily attach 
                  context menu listeners to specific items inside 'children' from this level 
                  without context. 
                  
                  However, the user request is "add the ability to create a note using the context menu on collections".
                  The collections list is likely passed as children or rendered inside.
                  
                  Wait, Sidebar is a layout component. The actual Collection List is probably passed IN as children.
                  I need to find where the Collection List is rendered. 
                  
                  Let's look at App.tsx to see what is passed into Sidebar.
                */}
                {children}
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={contextMenu.items}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </aside>
    )
}

/**
 * Sidebar section wrapper.
 */
export function SidebarSection({
    title,
    action,
    children
}: {
    title: string
    action?: ReactNode
    children: ReactNode
}) {
    return (
        <div>
            <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-text-secondary-dark uppercase tracking-widest">
                    {title}
                </span>
                {action}
            </div>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    )
}

