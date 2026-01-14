import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
    /** Visual style variant */
    variant?: 'default' | 'active' | 'removable'
    /** Show a colored dot indicator */
    dotColor?: 'blue' | 'purple' | 'green' | 'primary'
    /** Callback when remove button is clicked (only for removable variant) */
    onRemove?: () => void
}

/**
 * Tag/Badge component for displaying labels, hashtags, and categories.
 * 
 * Variants:
 * - `default`: Standard gray tag
 * - `active`: Highlighted with primary color
 * - `removable`: Tag with close button
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(
    ({ className, variant = 'default', dotColor, onRemove, children, ...props }, ref) => {
        const dotColorClasses = {
            blue: 'bg-accent-blue',
            purple: 'bg-accent-purple',
            green: 'bg-green-500',
            primary: 'bg-primary',
        }

        return (
            <span
                ref={ref}
                className={cn(
                    // Base styles
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px]',

                    // Variant styles
                    {
                        // Default and Removable: Gray background
                        'bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-600 dark:text-text-secondary-dark':
                            variant === 'default' || variant === 'removable',

                        // Active: Primary color accent
                        'bg-primary/10 border border-primary/20 text-primary font-mono':
                            variant === 'active',
                    },

                    className
                )}
                {...props}
            >
                {dotColor && (
                    <span className={cn('w-1.5 h-1.5 rounded-full', dotColorClasses[dotColor])} />
                )}
                {children}
                {variant === 'removable' && onRemove && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onRemove()
                        }}
                        className="hover:text-primary transition-colors ml-0.5"
                    >
                        <span className="material-icons-round text-[12px]">close</span>
                    </button>
                )}
            </span>
        )
    }
)

Tag.displayName = 'Tag'

/**
 * Inline hashtag component for use within text content.
 */
export function InlineTag({
    children,
    color = 'primary'
}: {
    children: React.ReactNode
    color?: 'primary' | 'blue' | 'purple'
}) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        blue: 'bg-accent-blue/10 text-accent-blue',
        purple: 'bg-accent-purple/10 text-accent-purple',
    }

    return (
        <span className={cn('font-mono px-1.5 rounded', colorClasses[color])}>
            {children}
        </span>
    )
}
