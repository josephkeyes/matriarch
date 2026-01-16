/**
 * Command Palette Button
 * 
 * Sidebar button that opens the command palette.
 * Shows as an icon with tooltip.
 */

import { cn } from '../../lib/cn'
import { useCommandPalette } from '../../contexts/CommandPaletteContext'

interface CommandPaletteButtonProps {
    /** Whether the sidebar is collapsed */
    collapsed?: boolean
}

export function CommandPaletteButton({ collapsed = false }: CommandPaletteButtonProps) {
    const { open } = useCommandPalette()

    return (
        <button
            onClick={open}
            className={cn(
                "group flex items-center gap-3 w-full rounded-lg transition-all duration-200",
                collapsed ? "px-2 py-2 justify-center" : "px-3 py-2",
                "text-slate-500 hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary",
                "hover:bg-primary/5 dark:hover:bg-primary/10"
            )}
            title={collapsed ? "Command Palette (⌘⇧P)" : undefined}
        >
            <span className={cn(
                "material-icons-round text-lg transition-transform",
                "group-hover:scale-110"
            )}>
                bolt
            </span>
            {!collapsed && (
                <>
                    <span className="flex-1 text-left text-sm font-medium">
                        Command Palette
                    </span>
                    <kbd className={cn(
                        "px-1.5 py-0.5 text-[10px] font-mono rounded",
                        "bg-slate-100 dark:bg-background-dark",
                        "text-slate-400 dark:text-text-secondary-dark",
                        "border border-slate-200 dark:border-border-dark",
                        "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}>
                        ⌘⇧P
                    </kbd>
                </>
            )}
        </button>
    )
}
