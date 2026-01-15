import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Visual style variant */
    variant?: 'default' | 'elevated' | 'interactive'
    /** Optional accent color for the card icon area */
    accentColor?: 'primary' | 'blue' | 'purple' | 'green'
}

/**
 * Card component for displaying content in a contained area.
 * Used for collection cards, note cards, and stat cards.
 * 
 * Variants:
 * - `default`: Standard bordered card
 * - `elevated`: Card with shadow for emphasis
 * - `interactive`: Hoverable card with transition effects
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    // Base styles
                    'bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5',

                    // Variant styles
                    {
                        'shadow-sm': variant === 'elevated',
                        'hover:shadow-lg transition-all cursor-pointer group': variant === 'interactive',
                    },

                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

/**
 * Card header section with icon and count display.
 */
export function CardHeader({
    icon,
    count,
    accentColor = 'primary'
}: {
    icon: string
    count?: string | number
    accentColor?: 'primary' | 'blue' | 'purple' | 'green'
}) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        blue: 'bg-accent-blue/10 text-accent-blue',
        purple: 'bg-accent-purple/10 text-accent-purple',
        green: 'bg-green-500/10 text-green-500',
    }

    return (
        <div className="flex items-start justify-between mb-4">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[accentColor])}>
                <span className="material-icons-round">{icon}</span>
            </div>
            {count !== undefined && (
                <span className="text-[10px] font-mono text-slate-400">{count} notes</span>
            )}
        </div>
    )
}

/**
 * Card title component.
 */
export function CardTitle({
    children,
    hoverColor = 'primary'
}: {
    children: React.ReactNode
    hoverColor?: 'primary' | 'blue' | 'green'
}) {
    const hoverClasses = {
        primary: 'group-hover:text-primary',
        blue: 'group-hover:text-accent-blue',
        green: 'group-hover:text-green-500',
    }

    return (
        <h3 className={cn(
            'font-bold text-slate-900 dark:text-text-main-dark mb-1 transition-colors',
            hoverClasses[hoverColor]
        )}>
            {children}
        </h3>
    )
}

/**
 * Card description text.
 */
export function CardDescription({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-slate-500 text-xs mb-4 line-clamp-2">
            {children}
        </p>
    )
}

/**
 * Card footer with timestamp and action.
 */
export function CardFooter({
    timestamp,
    actionLabel,
    actionColor = 'primary'
}: {
    timestamp: string
    actionLabel: string
    actionColor?: 'primary' | 'blue' | 'green'
}) {
    const actionClasses = {
        primary: 'text-primary',
        blue: 'text-accent-blue',
        green: 'text-green-500',
    }

    return (
        <div className="pt-4 border-t border-slate-100 dark:border-border-dark flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center">
                <span className="material-icons-round text-[12px] mr-1">history</span>
                {timestamp}
            </span>
            <span className={cn('font-semibold', actionClasses[actionColor])}>
                {actionLabel}
            </span>
        </div>
    )
}
