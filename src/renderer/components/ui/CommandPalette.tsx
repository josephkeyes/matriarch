/**
 * Command Palette Modal
 * 
 * Obsidian-style command palette for discovering and executing commands.
 * Features search filtering, keyboard navigation, and hotkey display.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { useCommandPalette } from '../../contexts/CommandPaletteContext'
import type { Command } from '../../../shared/api/contracts'

// Icon mapping for command categories
const categoryIcons: Record<string, string> = {
    'Navigation': 'navigation',
    'Application': 'apps',
    'Collections': 'folder_copy',
    'Notes': 'description',
    'AI': 'smart_toy',
    'default': 'terminal',
}

function getCategoryIcon(category?: string): string {
    return categoryIcons[category || ''] || categoryIcons.default
}

// Format accelerator for display (e.g., "CommandOrControl+Shift+P" -> "⌘⇧P")
function formatAccelerator(accelerator: string): string {
    return accelerator
        .replace(/CommandOrControl|CmdOrCtrl/g, '⌘')
        .replace(/Command|Cmd/g, '⌘')
        .replace(/Control|Ctrl/g, '⌃')
        .replace(/Alt|Option/g, '⌥')
        .replace(/Shift/g, '⇧')
        .replace(/\+/g, '')
}

interface CommandItemProps {
    command: Command
    isSelected: boolean
    onSelect: () => void
    onExecute: () => void
}

function CommandItem({ command, isSelected, onSelect, onExecute }: CommandItemProps) {
    const hotkey = command.hotkeys[0]?.accelerator

    return (
        <div
            className={cn(
                "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors",
                isSelected
                    ? "bg-primary/10 dark:bg-primary/20"
                    : "hover:bg-slate-100 dark:hover:bg-surface-dark/50"
            )}
            onMouseEnter={onSelect}
            onClick={onExecute}
        >
            <div className="flex items-center gap-3">
                <span className={cn(
                    "material-icons-round text-lg",
                    isSelected ? "text-primary" : "text-slate-400"
                )}>
                    {getCategoryIcon(command.category)}
                </span>
                <div>
                    <div className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-primary" : "text-slate-700 dark:text-text-main-dark"
                    )}>
                        {command.name}
                    </div>
                    {command.description && (
                        <div className="text-xs text-slate-500 dark:text-text-secondary-dark">
                            {command.description}
                        </div>
                    )}
                </div>
            </div>
            {hotkey && (
                <kbd className={cn(
                    "px-2 py-1 text-xs font-mono rounded",
                    "bg-slate-100 dark:bg-background-dark",
                    "text-slate-500 dark:text-text-secondary-dark",
                    "border border-slate-200 dark:border-border-dark"
                )}>
                    {formatAccelerator(hotkey)}
                </kbd>
            )}
        </div>
    )
}

export function CommandPalette() {
    const { isOpen, close, commands, isLoading, executeCommand, navigateToCommandSettings } = useCommandPalette()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    // Filter commands by search query (prefix matching)
    const filteredCommands = useMemo(() => {
        if (!searchQuery.trim()) return commands

        const query = searchQuery.toLowerCase()
        return commands.filter(cmd =>
            cmd.name.toLowerCase().startsWith(query) ||
            cmd.name.toLowerCase().includes(query) ||
            cmd.category?.toLowerCase().includes(query)
        )
    }, [commands, searchQuery])

    // Group commands by category
    const groupedCommands = useMemo(() => {
        const groups: Record<string, Command[]> = {}
        for (const cmd of filteredCommands) {
            const category = cmd.category || 'Other'
            if (!groups[category]) groups[category] = []
            groups[category].push(cmd)
        }
        return groups
    }, [filteredCommands])

    // Flatten for keyboard navigation
    const flatCommands = filteredCommands

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('')
            setSelectedIndex(0)
            // Focus input after render
            setTimeout(() => inputRef.current?.focus(), 0)
        }
    }, [isOpen])

    // Reset selection when search changes
    useEffect(() => {
        setSelectedIndex(0)
    }, [searchQuery])

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(i => Math.min(i + 1, flatCommands.length - 1))
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(i => Math.max(i - 1, 0))
                    break
                case 'Enter':
                    e.preventDefault()
                    if (flatCommands[selectedIndex]) {
                        executeCommand(flatCommands[selectedIndex].id)
                    }
                    break
                case 'Escape':
                    e.preventDefault()
                    close()
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, selectedIndex, flatCommands, executeCommand, close])

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current && flatCommands[selectedIndex]) {
            const items = listRef.current.querySelectorAll('[data-command-item]')
            items[selectedIndex]?.scrollIntoView({ block: 'nearest' })
        }
    }, [selectedIndex, flatCommands])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={close}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className={cn(
                "relative w-full max-w-xl mx-4 rounded-xl overflow-hidden",
                "bg-white dark:bg-surface-dark",
                "border border-slate-200 dark:border-border-dark",
                "shadow-2xl"
            )}>
                {/* Search Input */}
                <div className="flex items-center px-4 border-b border-slate-200 dark:border-border-dark">
                    <span className="material-icons-round text-slate-400 mr-3">search</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className={cn(
                            "flex-1 py-4 bg-transparent outline-none",
                            "text-slate-900 dark:text-text-main-dark",
                            "placeholder-slate-400 dark:placeholder-text-secondary-dark"
                        )}
                        placeholder="Type a command..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="p-1 text-slate-400 hover:text-slate-600"
                        >
                            <span className="material-icons-round text-sm">close</span>
                        </button>
                    )}
                </div>

                {/* Command List */}
                <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-slate-400">
                            <span className="material-icons-round animate-spin mr-2">refresh</span>
                            Loading commands...
                        </div>
                    ) : flatCommands.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <span className="material-icons-round text-3xl mb-2">search_off</span>
                            <p className="text-sm">No commands found</p>
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, cmds]) => (
                            <div key={category}>
                                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-background-dark/50">
                                    {category}
                                </div>
                                {cmds.map(cmd => {
                                    const globalIndex = flatCommands.findIndex(c => c.id === cmd.id)
                                    return (
                                        <div key={cmd.id} data-command-item>
                                            <CommandItem
                                                command={cmd}
                                                isSelected={globalIndex === selectedIndex}
                                                onSelect={() => setSelectedIndex(globalIndex)}
                                                onExecute={() => executeCommand(cmd.id)}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer with Settings Link */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/50">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 rounded border border-slate-300 dark:border-border-dark">↑↓</kbd>
                            navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 rounded border border-slate-300 dark:border-border-dark">↵</kbd>
                            select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 rounded border border-slate-300 dark:border-border-dark">esc</kbd>
                            close
                        </span>
                    </div>
                    <button
                        onClick={navigateToCommandSettings}
                        className={cn(
                            "p-1.5 rounded-full transition-colors",
                            "text-slate-400 hover:text-slate-600 dark:hover:text-text-main-dark",
                            "hover:bg-slate-200 dark:hover:bg-surface-dark"
                        )}
                        title="Command Settings"
                    >
                        <span className="material-icons-round text-lg">settings</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
