import { HTMLAttributes, forwardRef } from 'react'
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
}

/**
 * Navigation item component for sidebar navigation.
 * Supports icons, active states, counts, and nested indentation.
 */
export const NavItem = forwardRef<HTMLDivElement, NavItemProps>(
    ({ className, icon, label, isActive = false, count, level = 0, ...props }, ref) => {
        const paddingClasses = {
            0: 'px-2',
            1: 'pl-6 pr-2',
            2: 'pl-10 pr-2',
        }

        return (
            <div
                ref={ref}
                className={cn(
                    // Base styles
                    'flex items-center space-x-2 py-1.5 rounded-md cursor-pointer group',
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
                    'text-sm font-medium truncate',
                    {
                        'text-slate-600 dark:text-text-secondary-dark': !isActive && level > 0,
                        'text-slate-900 dark:text-text-main-dark': !isActive && level === 0,
                        'text-primary': isActive,
                    }
                )}>
                    {label}
                </span>
                {count !== undefined && (
                    <span className="ml-auto text-[10px] text-slate-400 dark:text-text-secondary-dark font-mono">
                        {count}
                    </span>
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
