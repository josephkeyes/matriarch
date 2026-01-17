import { useState } from 'react';
import { cn } from '../../lib/cn';

export interface ToolbarAction {
    id: string;
    label: string;
    icon?: string;
    shortLabel?: string;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    hasSubmenu?: boolean;
    submenuItems?: SubmenuItem[];
}

export interface SubmenuItem {
    id: string;
    label: string;
    onClick: () => void;
    isActive?: boolean;
}

export interface FloatingToolbarProps {
    position: { top: number; left: number };
    formattingActions: ToolbarAction[];
    aiActions?: ToolbarAction[];
    onClose: () => void;
}

/**
 * FloatingToolbar component
 * A floating toolbar that appears above text selection for quick formatting actions.
 * Designed to match the modern, clean aesthetic of the application.
 */
export function FloatingToolbar({
    position,
    formattingActions,
    aiActions = [],
    onClose,
}: FloatingToolbarProps) {
    const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);

    const handleActionClick = (action: ToolbarAction) => {
        if (action.hasSubmenu && action.submenuItems) {
            // Toggle submenu
            setOpenSubmenuId(openSubmenuId === action.id ? null : action.id);
        } else {
            action.onClick();
            setOpenSubmenuId(null);
        }
    };

    const handleSubmenuItemClick = (item: SubmenuItem) => {
        item.onClick();
        setOpenSubmenuId(null);
    };

    return (
        <div
            className="fixed z-[9999] flex items-center gap-0.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg shadow-xl px-1 py-1 animate-toolbar-fade-in"
            style={{
                top: position.top,
                left: position.left,
                transform: 'translateX(-50%)',
            }}
            onMouseDown={(e) => {
                // Prevent toolbar clicks from clearing selection
                e.preventDefault();
            }}
        >
            {/* Formatting Actions */}
            {formattingActions.map((action) => (
                <div key={action.id} className="relative">
                    <button
                        onClick={() => handleActionClick(action)}
                        disabled={action.disabled}
                        title={action.label}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold transition-colors",
                            action.isActive || openSubmenuId === action.id
                                ? "bg-primary/10 text-primary"
                                : "text-slate-600 dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-background-dark",
                            action.disabled && "opacity-40 cursor-not-allowed"
                        )}
                    >
                        {action.icon ? (
                            <span className="material-icons-round text-[18px]">{action.icon}</span>
                        ) : (
                            <span>{action.shortLabel || action.label.charAt(0)}</span>
                        )}
                    </button>

                    {/* Submenu Flyout */}
                    {action.hasSubmenu && action.submenuItems && openSubmenuId === action.id && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg shadow-xl py-1 min-w-[80px] animate-toolbar-fade-in z-[10000]">
                            {action.submenuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSubmenuItemClick(item)}
                                    className={cn(
                                        "w-full px-3 py-1.5 text-left text-sm font-medium transition-colors",
                                        item.isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-slate-600 dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-background-dark"
                                    )}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* Divider between formatting and AI actions */}
            {aiActions.length > 0 && (
                <div className="w-px h-5 bg-slate-200 dark:bg-border-dark mx-1" />
            )}

            {/* AI Actions */}
            {/* AI Actions */}
            {aiActions.map((action) => (
                <div key={action.id} className="relative">
                    <button
                        onClick={() => handleActionClick(action)}
                        disabled={action.disabled}
                        title={action.label}
                        className={cn(
                            "h-8 px-2.5 flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors",
                            action.isActive || openSubmenuId === action.id
                                ? "bg-primary/10 text-primary"
                                : "text-slate-600 dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-background-dark",
                            action.disabled && "opacity-40 cursor-not-allowed"
                        )}
                    >
                        {action.icon && (
                            <span className="material-icons-round text-[16px]">{action.icon}</span>
                        )}
                        <span>{action.label}</span>
                    </button>

                    {/* Submenu Flyout */}
                    {action.hasSubmenu && action.submenuItems && openSubmenuId === action.id && (
                        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg shadow-xl py-1 min-w-[120px] animate-toolbar-fade-in z-[10000]">
                            {action.submenuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSubmenuItemClick(item)}
                                    className={cn(
                                        "w-full px-3 py-1.5 text-left text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-background-dark",
                                        item.isActive
                                            ? "text-primary"
                                            : "text-slate-600 dark:text-text-secondary-dark"
                                    )}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
