import { useState } from 'react'
import { cn } from '../../lib/cn'
import type { AIProviderInfo } from '../../../shared/api/contracts'

interface ProviderCardProps {
    provider: AIProviderInfo
    onToggle: (providerId: string, enabled: boolean) => void
    onConfigChange: (providerId: string, config: Record<string, unknown>) => void
    onTestConnection: (providerId: string) => void
    children?: React.ReactNode
}

/**
 * Card component for an AI provider with toggle and status.
 */
export function ProviderCard({
    provider,
    onToggle,
    children,
}: ProviderCardProps) {
    const [isExpanded, setIsExpanded] = useState(provider.enabled)

    const handleToggle = () => {
        const newEnabled = !provider.enabled
        onToggle(provider.id, newEnabled)
        if (newEnabled) {
            setIsExpanded(true)
        }
    }

    return (
        <div className={cn(
            'border rounded-xl p-5 transition-all',
            provider.enabled
                ? 'border-primary/30 bg-primary/5 dark:bg-primary/10'
                : 'border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark'
        )}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {/* Provider Icon */}
                    <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        provider.enabled
                            ? 'bg-primary/10 text-primary'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    )}>
                        <span className="material-icons-round text-lg">terminal</span>
                    </div>

                    {/* Provider Info */}
                    <div>
                        <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-slate-900 dark:text-text-main-dark">
                                {provider.name}
                            </h4>
                            {/* Status Badge */}
                            <span className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                provider.available
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            )}>
                                {provider.available ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-text-secondary-dark mt-0.5">
                            {provider.description}
                        </p>
                    </div>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={handleToggle}
                    className={cn(
                        'relative w-12 h-6 rounded-full transition-colors',
                        provider.enabled
                            ? 'bg-primary'
                            : 'bg-slate-300 dark:bg-slate-700'
                    )}
                >
                    <span className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                        provider.enabled ? 'left-7' : 'left-1'
                    )} />
                </button>
            </div>

            {/* Expand/Collapse Button */}
            {provider.enabled && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 flex items-center text-xs font-medium text-slate-500 dark:text-text-secondary-dark hover:text-primary transition-colors"
                >
                    <span className="material-icons-round text-sm mr-1">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                    {isExpanded ? 'Hide Configuration' : 'Show Configuration'}
                </button>
            )}

            {/* Configuration Panel */}
            {provider.enabled && isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-border-dark/50">
                    {children}
                </div>
            )}
        </div>
    )
}
