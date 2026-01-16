import { ReactNode, useState, useEffect } from 'react'
import { cn } from '../../lib/cn'
import { SearchInput } from '../ui/SearchInput'
import { Button } from '../ui/Button'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import { Collection } from '../../../shared/api/contracts'

export interface SidebarProps {
    /** Custom header content (overrides title/searchInHeader) */
    header?: ReactNode
    /** Sidebar title or header content (legacy/default) */
    title?: string | ReactNode
    /** Whether sidebar is collapsible */
    collapsible?: boolean
    /** Callback when collapse button is clicked */
    onCollapse?: () => void
    /** Search configuration */
    searchPlaceholder?: string
    onSearch?: (query: string) => void
    /** Whether to render search input in the header */
    searchInHeader?: boolean
    /** Sidebar content sections */
    children: ReactNode
    /** Additional className */
    className?: string
    /** Current collapsed state */
    isCollapsed?: boolean
    /** Width variant */
    width?: 'narrow' | 'default' | 'wide'
}

/**
 * Left sidebar component with search and navigation sections.
 */
export function Sidebar({
    header,
    title = 'MAIN NAVIGATION',
    collapsible = true,
    onCollapse,
    isCollapsed = false,
    searchPlaceholder = 'Search knowledge...',
    onSearch,
    searchInHeader = false,
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
            isCollapsed ? 'w-16' : widthClasses[width],
            'border-r border-slate-200 dark:border-border-dark',
            'flex flex-col',
            'bg-white dark:bg-surface-dark',
            'overflow-y-auto custom-scrollbar',
            'transition-all duration-300 ease-in-out',
            className
        )}>
            {/* Header */}
            {header ? (
                <div className="border-b border-slate-100 dark:border-border-dark/50">
                    {header}
                </div>
            ) : (
                <div className={cn(
                    "flex items-center border-b border-slate-100 dark:border-border-dark/50 min-h-[53px]",
                    isCollapsed ? "justify-center p-2" : "justify-between p-4"
                )}>
                    {!isCollapsed && (
                        searchInHeader ? (
                            <div className="flex-1 mr-2">
                                <SearchInput
                                    placeholder={searchPlaceholder}
                                    onChange={(e) => onSearch?.(e.target.value)}
                                    className="bg-slate-50 dark:bg-background-dark/50"
                                />
                            </div>
                        ) : (
                            typeof title === 'string' ? (
                                <h2 className="font-semibold text-sm tracking-wide text-slate-900 dark:text-text-main-dark transition-opacity duration-200">
                                    {title}
                                </h2>
                            ) : (
                                <div className="flex-1 mr-2">{title}</div>
                            )
                        )
                    )}
                    {collapsible && (
                        <Button variant="ghost" size="icon" onClick={onCollapse} className="p-0.5">
                            <span className={cn(
                                "material-icons-round text-slate-400 text-sm transition-transform duration-300",
                                isCollapsed && "rotate-180"
                            )}>
                                keyboard_double_arrow_left
                            </span>
                        </Button>
                    )}
                </div>
            )}


            {/* Navigation sections */}
            <div className={cn(
                "pb-6 flex-1",
                isCollapsed ? "px-2 pt-4" : "px-2 space-y-6"
            )}>
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
    children,
    isCollapsed = false
}: {
    title: string
    action?: ReactNode
    children: ReactNode
    isCollapsed?: boolean
}) {
    // If collapsed, we just render children, hiding the section header
    if (isCollapsed) {
        return <div className="space-y-1">{children}</div>
    }

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

