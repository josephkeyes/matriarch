import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'nav' | 'nav-active'
    /** Size of the button */
    size?: 'sm' | 'md' | 'lg' | 'icon'
}

/**
 * Button component with multiple variants matching the Matriarch design system.
 * 
 * Variants:
 * - `primary`: Dark background (inverts in dark mode)
 * - `secondary`: Outlined style
 * - `ghost`: Minimal style for icons/actions
 * - `nav`: Navigation link style
 * - `nav-active`: Active navigation state with primary accent
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    // Base styles
                    'inline-flex items-center justify-center font-medium transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    'disabled:opacity-50 disabled:pointer-events-none',

                    // Size variants
                    {
                        'px-2 py-1 text-xs rounded-md': size === 'sm',
                        'px-4 py-2 text-sm rounded-lg': size === 'md',
                        'px-6 py-3 text-base rounded-lg': size === 'lg',
                        'p-2 rounded-md': size === 'icon',
                    },

                    // Style variants
                    {
                        // Primary: Dark button that inverts in dark mode
                        'bg-slate-900 dark:bg-text-main-dark dark:text-background-dark text-white hover:opacity-90':
                            variant === 'primary',

                        // Secondary: Outlined style
                        'border border-slate-200 dark:border-border-dark bg-transparent hover:bg-slate-50 dark:hover:bg-surface-dark text-slate-700 dark:text-text-main-dark':
                            variant === 'secondary',

                        // Ghost: Minimal for icons
                        'text-slate-400 hover:text-slate-600 dark:text-text-secondary-dark dark:hover:text-text-main-dark bg-transparent':
                            variant === 'ghost',

                        // Nav: Inactive navigation link
                        'text-slate-500 hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary bg-transparent':
                            variant === 'nav',

                        // Nav Active: Active navigation state
                        'text-primary bg-primary/5 dark:bg-primary/10 font-semibold':
                            variant === 'nav-active',
                    },

                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
