import { useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'

export interface ContextMenuItem {
    label: string
    action: () => void
    icon?: string
    variant?: 'default' | 'danger'
}

export interface ContextMenuProps {
    x: number
    y: number
    items: ContextMenuItem[]
    onClose: () => void
}

/**
 * ContextMenu component
 * Renders a fixed position menu at the specified coordinates.
 * Handles clicking outside to close.
 */
export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        // Use mousedown to capture the click before it triggers other things
        document.addEventListener('mousedown', handleClickOutside)
        // Also close on scroll to avoid detached menus
        window.addEventListener('scroll', onClose, true)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('scroll', onClose, true)
        }
    }, [onClose])

    if (items.length === 0) return null

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[160px] bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: y, left: x }}
        >
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => {
                        item.action()
                        onClose()
                    }}
                    className={cn(
                        "w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-background-dark transition-colors",
                        item.variant === 'danger'
                            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                            : "text-slate-700 dark:text-text-main-dark"
                    )}
                >
                    {item.icon && (
                        <span className="material-icons-round text-[16px]">
                            {item.icon}
                        </span>
                    )}
                    {item.label}
                </button>
            ))}
        </div>
    )
}
