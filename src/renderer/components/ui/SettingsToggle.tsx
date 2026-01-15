import { cn } from '../../lib/cn'

export interface SettingsToggleProps {
    /** Main label for the toggle */
    label: string
    /** Description text below the label */
    description?: string
    /** Whether the toggle is checked */
    checked: boolean
    /** Callback when toggle changes */
    onChange: (checked: boolean) => void
    /** Additional className */
    className?: string
    /** Whether the toggle is disabled */
    disabled?: boolean
}

/**
 * Toggle switch component for settings pages.
 * Styled to match the Matriarch design system with primary accent color.
 */
export function SettingsToggle({
    label,
    description,
    checked,
    onChange,
    className,
    disabled = false
}: SettingsToggleProps) {
    return (
        <div className={cn(
            'flex items-center justify-between p-4 bg-slate-50 dark:bg-surface-dark rounded-lg border border-slate-100 dark:border-border-dark',
            disabled && 'opacity-50 cursor-not-allowed',
            className
        )}>
            <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-text-main-dark">
                    {label}
                </h4>
                {description && (
                    <p className="text-xs text-slate-500 dark:text-text-secondary-dark mt-0.5">
                        {description}
                    </p>
                )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                />
                <div className={cn(
                    'w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full',
                    'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50',
                    'peer-checked:after:translate-x-full peer-checked:after:border-white',
                    "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                    'after:bg-white after:border-gray-300 after:border after:rounded-full',
                    'after:h-5 after:w-5 after:transition-all',
                    'peer-checked:bg-primary',
                    'transition-colors'
                )} />
            </label>
        </div>
    )
}
