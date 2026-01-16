import React, { useCallback } from 'react'
import { ThemeProvider } from './ThemeContext'
import { ContextMenuProvider } from './ContextMenuContext'
import { CommandPaletteProvider } from './CommandPaletteContext'

interface AppProvidersProps {
    children: React.ReactNode
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    // We need to handle internal command palette navigation events here
    // or pass a handler that eventually delegates to the App's navigation.
    // Since AppProviders wraps everything, it can't easily access the App's navigation state 
    // unless we lift state up or use a separate NavigationContext.
    // For now, we'll keep the simple event dispatching mechanism in App.tsx 
    // and just provide the contexts here.

    // However, CommandPaletteProvider requires onNavigateToSettings and onCommandExecuted.
    // To strictly separate, we might need to modify how CommandPaletteProvider works 
    // or pass these handlers into AppProviders.
    // For this refactor, let's keep it simple: AppProviders just composes the contexts 
    // that don't depend on App state, or we pass the handlers down.

    // Actually, CommandPaletteProvider is tightly coupled with App's callback.
    // Let's defer moving CommandPaletteProvider into this generic wrapper 
    // if it requires specific handlers from the parent. 
    // Instead, we can wrap Theme and ContextMenu here, 
    // and let App handle CommandPaletteProvider until we fix that coupling.

    return (
        <ThemeProvider>
            <ContextMenuProvider>
                {children}
            </ContextMenuProvider>
        </ThemeProvider>
    )
}
