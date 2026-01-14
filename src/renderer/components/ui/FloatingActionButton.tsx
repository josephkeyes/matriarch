import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

export interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Icon to display (Material Icons name) */
    icon?: string
    /** Size of the button */
    size?: 'md' | 'lg'
}

/**
 * Floating Action Button (FAB) component.
 * Fixed position button in the bottom-right corner for primary actions.
 */
export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
    ({ className, icon = 'add', size = 'lg', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    // Position
                    'fixed bottom-6 right-6 z-50',

                    // Sizing
                    {
                        'w-12 h-12': size === 'md',
                        'w-14 h-14': size === 'lg',
                    },

                    // Styling
                    'bg-primary text-white rounded-full',
                    'shadow-2xl shadow-primary/40',
                    'flex items-center justify-center',

                    // Interactions
                    'transform transition-transform',
                    'hover:scale-110 active:scale-95',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',

                    className
                )}
                {...props}
            >
                <span className={cn(
                    'material-icons-round',
                    { 'text-xl': size === 'md', 'text-2xl': size === 'lg' }
                )}>
                    {icon}
                </span>
            </button>
        )
    }
)

FloatingActionButton.displayName = 'FloatingActionButton'
