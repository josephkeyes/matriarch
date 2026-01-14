import { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { SearchInput } from '../ui/SearchInput'
import { Button } from '../ui/Button'

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
                <h2 className="font-semibold text-sm tracking-wide text-slate-900 dark:text-white">
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
                {children}
            </div>
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
