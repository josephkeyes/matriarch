import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Label displayed above the value */
    label: string
    /** Main statistic value */
    value: string | number
    /** Optional change indicator (e.g., "+12 this week") */
    change?: string
    /** Color for the change indicator */
    changeColor?: 'green' | 'primary' | 'red'
}

/**
 * Stat card component for displaying metrics in the insights panel.
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
    ({ className, label, value, change, changeColor = 'green', ...props }, ref) => {
        const changeColorClasses = {
            green: 'text-green-500',
            primary: 'text-primary',
            red: 'text-red-500',
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'bg-white dark:bg-slate-900 p-4 rounded-xl',
                    'border border-slate-200 dark:border-slate-800',
                    className
                )}
                {...props}
            >
                <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">
                    {label}
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {value}
                </span>
                {change && (
                    <span className={cn('text-[10px] block', changeColorClasses[changeColor])}>
                        {change}
                    </span>
                )}
            </div>
        )
    }
)

StatCard.displayName = 'StatCard'
