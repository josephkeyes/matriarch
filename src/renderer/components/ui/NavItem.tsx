import { HTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '../../lib/cn'

export interface NavItemProps extends HTMLAttributes<HTMLDivElement> {
    /** Material Icons icon name */
    icon: string
    /** Label text */
    label: string
    /** Whether this item is currently active */
    isActive?: boolean
    /** Optional count/badge to display */
    count?: number | string
    /** Indentation level (for nested items) */
    level?: 0 | 1 | 2
    /** Nested children */
    children?: React.ReactNode
    /** Default expanded state */
    defaultExpanded?: boolean
}

/**
 * Navigation item component for sidebar navigation.
 * Supports icons, active states, counts, and nested indentation.
 */
export const NavItem = forwardRef<HTMLDivElement, NavItemProps>(
    ({ className, icon, label, isActive = false, count, level = 0, children, defaultExpanded = false, ...props }, ref) => {
        const [isExpanded, setIsExpanded] = useState(defaultExpanded)
        const hasChildren = !!children

        const paddingClasses = {
            0: 'px-2',
            1: 'pl-6 pr-2',
            2: 'pl-10 pr-2',
        }

        const handleToggle = (e: React.MouseEvent) => {
            if (hasChildren) {
                e.stopPropagation() // Prevent triggering navigation
                setIsExpanded(!isExpanded)
            }
        }

        return (
            <div>
                <div
                    ref={ref}
                    className={cn(
                        // Base styles
                        'flex items-center space-x-2 py-1.5 rounded-md cursor-pointer group select-none',
                        paddingClasses[level],

                        // State styles
                        {
                            'hover:bg-slate-50 dark:hover:bg-background-dark': !isActive,
                            'bg-primary/5 border-l-2 border-primary': isActive,
                        },

                        className
                    )}
                    {...props}
                >
                    {hasChildren && (
                        <button
                            onClick={handleToggle}
                            className="p-0.5 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-1"
                        >
                            <span className="material-icons-round text-slate-400 text-[16px] block">
                                {isExpanded ? 'expand_more' : 'chevron_right'}
                            </span>
                        </button>
                    )}

                    {!hasChildren && <div className="w-[20px]" />} {/* Spacer for alignment if no chevron */}

                    <span className={cn(
                        'material-icons-round text-sm transition-colors',
                        {
                            'text-slate-400 group-hover:text-primary': !isActive,
                            'text-primary': isActive,
                        }
                    )}>
                        {icon}
                    </span>
                    <span className={cn(
                        'text-sm font-medium truncate flex-1',
                        {
                            'text-slate-600 dark:text-text-secondary-dark': !isActive && level > 0,
                            'text-slate-900 dark:text-text-main-dark': !isActive && level === 0,
                            'text-primary': isActive,
                        }
                    )}>
                        {label}
                    </span>
                    {count !== undefined && (
                        <span className="ml-2 text-[10px] text-slate-400 dark:text-text-secondary-dark font-mono">
                            {count}
                        </span>
                    )}
                </div>

                {/* Nested Children */}
                {hasChildren && isExpanded && (
                    <div className="mt-1">
                        {children}
                    </div>
                )}
            </div>
        )
    }
)

NavItem.displayName = 'NavItem'

/**
 * Section header for sidebar navigation groups.
 */
export function NavSection({
    title,
    action
}: {
    title: string
    action?: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-text-secondary-dark uppercase tracking-widest">
                {title}
            </span>
            {action}
        </div>
    )
}
