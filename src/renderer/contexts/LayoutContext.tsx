/**
 * Layout Context
 * 
 * Manages the state of the application layout, specifically
 * the visibility of sidebars.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface LayoutContextValue {
    // Left Sidebar
    isLeftSidebarCollapsed: boolean
    toggleLeftSidebar: () => void
    setLeftSidebarCollapsed: (collapsed: boolean) => void

    // Right Sidebar
    isRightSidebarCollapsed: boolean
    toggleRightSidebar: () => void
    setRightSidebarCollapsed: (collapsed: boolean) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false)
    const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false)

    const toggleLeftSidebar = () => setIsLeftSidebarCollapsed(prev => !prev)
    const toggleRightSidebar = () => setIsRightSidebarCollapsed(prev => !prev)

    const value = {
        isLeftSidebarCollapsed,
        toggleLeftSidebar,
        setLeftSidebarCollapsed: setIsLeftSidebarCollapsed,
        isRightSidebarCollapsed,
        toggleRightSidebar,
        setRightSidebarCollapsed: setIsRightSidebarCollapsed,
    }

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    )
}

export function useLayoutContext() {
    const context = useContext(LayoutContext)
    if (!context) {
        throw new Error('useLayoutContext must be used within a LayoutProvider')
    }
    return context
}
