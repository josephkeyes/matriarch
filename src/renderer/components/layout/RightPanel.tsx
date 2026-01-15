import { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'

export interface RightPanelProps {
    /** Panel sections */
    children: ReactNode
    /** Additional className */
    className?: string
    /** Width variant */
    width?: 'narrow' | 'default'
    /** Whether panel is collapsible */
    collapsible?: boolean
    /** Callback when collapse button is clicked */
    onCollapse?: () => void
    /** Current collapsed state */
    isCollapsed?: boolean
}

/**
 * Right panel component for insights, tasks, and activity.
 */
export function RightPanel({
    children,
    className,
    width = 'default',
    collapsible = true,
    onCollapse,
    isCollapsed = false
}: RightPanelProps) {
    const widthClasses = {
        narrow: 'w-72',
        default: 'w-80',
    }

    return (
        <aside className={cn(
            isCollapsed ? 'w-12' : widthClasses[width],
            'border-l border-slate-200 dark:border-border-dark',
            'flex flex-col',
            'bg-white dark:bg-surface-dark',
            'overflow-hidden',
            'transition-all duration-300 ease-in-out',
            className
        )}>
            {/* Header / Collapse Toggle */}
            {collapsible && (
                <div className={cn(
                    "flex items-center min-h-[40px]",
                    isCollapsed ? "justify-center py-2" : "justify-start px-4 py-2"
                )}>
                    <Button variant="ghost" size="icon" onClick={onCollapse} className="p-0.5" title={isCollapsed ? "Expand Panel" : "Collapse Panel"}>
                        <span className={cn(
                            "material-icons-round text-slate-400 text-sm transition-transform duration-300",
                            isCollapsed && "rotate-180"
                        )}>
                            keyboard_double_arrow_right
                        </span>
                    </Button>
                </div>
            )}

            <div className={cn(
                "flex-1 flex flex-col overflow-y-auto custom-scrollbar transition-opacity duration-200",
                isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
            )}>
                {children}
            </div>
        </aside>
    )
}

/**
 * Insights section with refresh button.
 */
export function InsightsSection({
    title = 'GLOBAL INSIGHTS',
    onRefresh,
    children
}: {
    title?: string
    onRefresh?: () => void
    children: ReactNode
}) {
    return (
        <div className="flex-1 relative bg-slate-50 dark:bg-background-dark p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {title}
                </span>
                {onRefresh && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="p-1.5 shadow-sm"
                        onClick={onRefresh}
                    >
                        <span className="material-icons-round text-xs">refresh</span>
                    </Button>
                )}
            </div>
            {children}
        </div>
    )
}

/**
 * Tasks section with count badge.
 */
export function TasksSection({
    title = 'PENDING TASKS',
    count,
    children
}: {
    title?: string
    count?: number
    children: ReactNode
}) {
    return (
        <div className="h-[45%] border-t border-slate-200 dark:border-border-dark p-6 flex flex-col bg-white dark:bg-surface-dark">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {title}
                </span>
                {count !== undefined && (
                    <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 rounded">
                        {count}
                    </span>
                )}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {children}
            </div>
        </div>
    )
}

/**
 * Activity bar chart section.
 */
export function ActivitySection({
    title = 'ACTIVITY',
    period,
    data
}: {
    title?: string
    period?: string
    data: number[]
}) {
    const maxValue = Math.max(...data, 1)

    return (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-border-dark">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {title}
                </span>
                {period && (
                    <span className="text-[10px] text-slate-400 font-mono">
                        {period}
                    </span>
                )}
            </div>
            <div className="flex space-x-1 h-12 items-end">
                {data.map((value, index) => (
                    <div
                        key={index}
                        className="flex-1 bg-primary rounded-t transition-all"
                        style={{
                            height: `${(value / maxValue) * 100}%`,
                            opacity: 0.2 + (value / maxValue) * 0.8
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * Task item component.
 */
export function TaskItem({
    label,
    completed = false,
    onClick
}: {
    label: string
    completed?: boolean
    onClick?: () => void
}) {
    return (
        <div
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={onClick}
        >
            <div className={cn(
                'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                completed
                    ? 'bg-primary border-primary'
                    : 'border-slate-300 dark:border-border-dark'
            )}>
                {completed && (
                    <span className="material-icons-round text-white text-[10px]">check</span>
                )}
            </div>
            <span className={cn(
                'text-sm transition-colors',
                completed
                    ? 'text-slate-400 line-through'
                    : 'text-slate-600 dark:text-text-secondary-dark group-hover:text-primary'
            )}>
                {label}
            </span>
        </div>
    )
}
