import { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'

export interface HeaderProps {
    /** Application logo/branding */
    logo?: ReactNode
    /** Navigation items */
    navigation?: ReactNode
    /** Right-side actions */
    actions?: ReactNode
    /** Additional className */
    className?: string
}

/**
 * Application header component.
 * Sticky position with backdrop blur effect.
 */
export function Header({ logo, navigation, actions, className }: HeaderProps) {
    return (
        <header className={cn(
            'h-14 border-b border-slate-200 dark:border-border-dark',
            'bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md',
            'flex items-center justify-between px-4',
            'z-50 sticky top-0',
            className
        )}>
            <div className="flex items-center space-x-6">
                {logo || <DefaultLogo />}
                {navigation}
            </div>
            {actions}
        </header>
    )
}

/**
 * Default Matriarch logo component.
 */
export function DefaultLogo() {
    return (
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span className="material-icons-round text-sm">auto_awesome</span>
            </div>
            <span className="font-bold tracking-tight text-lg dark:text-text-main-dark">
                Matriarch
            </span>
        </div>
    )
}

/**
 * Header navigation component.
 */
export function HeaderNav({
    items,
    activeItem
}: {
    items: { id: string; label: string; href?: string }[]
    activeItem?: string
}) {
    return (
        <nav className="hidden md:flex items-center space-x-1">
            {items.map((item) => (
                <Button
                    key={item.id}
                    variant={activeItem === item.id ? 'nav-active' : 'nav'}
                    size="sm"
                    className="px-3 py-1.5"
                >
                    {item.label}
                </Button>
            ))}
        </nav>
    )
}

/**
 * Header actions (settings, notifications, user).
 */
export function HeaderActions({
    onSettingsClick,
    onNotificationsClick,
    userAvatar
}: {
    onSettingsClick?: () => void
    onNotificationsClick?: () => void
    userAvatar?: string
}) {
    return (
        <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onSettingsClick}>
                <span className="material-icons-round">settings</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onNotificationsClick}>
                <span className="material-icons-round">notifications</span>
            </Button>
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-border-dark">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-border-dark bg-slate-100 dark:bg-surface-dark">
                    {userAvatar ? (
                        <img
                            src={userAvatar}
                            alt="User avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="material-icons-round text-slate-400 w-full h-full flex items-center justify-center">
                            person
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
