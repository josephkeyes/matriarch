import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /** Icon to display (Material Icons name) */
    icon?: string
}

/**
 * Search input component with icon and focus styling.
 * Matches the Matriarch design system search bar pattern.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    ({ className, icon = 'search', placeholder = 'Search...', ...props }, ref) => {
        return (
            <div className="relative group">
                <span className={cn(
                    'material-icons-round absolute left-3 top-1/2 -translate-y-1/2',
                    'text-slate-400 text-lg group-focus-within:text-primary transition-colors'
                )}>
                    {icon}
                </span>
                <input
                    ref={ref}
                    type="text"
                    placeholder={placeholder}
                    className={cn(
                        // Base styles
                        'w-full bg-slate-100 dark:bg-background-dark',
                        'border-none rounded-lg',
                        'pl-10 pr-4 py-2 text-sm',
                        'focus:ring-2 focus:ring-primary focus:outline-none',
                        'transition-all',
                        'placeholder:text-slate-400 dark:placeholder:text-text-secondary-dark',
                        'dark:text-text-main-dark',
                        className
                    )}
                    {...props}
                />
            </div>
        )
    }
)

SearchInput.displayName = 'SearchInput'
