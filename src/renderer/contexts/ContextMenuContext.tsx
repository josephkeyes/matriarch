import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { ContextMenu, ContextMenuItem } from '../components/ui/ContextMenu'

interface ContextMenuContextValue {
    showContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void
    hideContextMenu: () => void
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null)

export function ContextMenuProvider({ children }: { children: ReactNode }) {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
    const [items, setItems] = useState<ContextMenuItem[]>([])

    const showContextMenu = useCallback((event: React.MouseEvent, menuItems: ContextMenuItem[]) => {
        event.preventDefault()
        event.stopPropagation()
        setPosition({ x: event.clientX, y: event.clientY })
        setItems(menuItems)
    }, [])

    const hideContextMenu = useCallback(() => {
        setPosition(null)
        setItems([])
    }, [])

    return (
        <ContextMenuContext.Provider value={{ showContextMenu, hideContextMenu }}>
            {children}
            {position && (
                <ContextMenu
                    x={position.x}
                    y={position.y}
                    items={items}
                    onClose={hideContextMenu}
                />
            )}
        </ContextMenuContext.Provider>
    )
}

export function useContextMenu() {
    const context = useContext(ContextMenuContext)
    if (!context) {
        throw new Error('useContextMenu must be used within a ContextMenuProvider')
    }
    return context
}
