import React from 'react'
import { Button, FloatingActionButton } from './ui'

interface DashboardViewProps {
    onCreateCollection: () => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onCreateCollection }) => {
    return (
        <>
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-border-dark/50 sticky top-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md z-40">
                <div className="flex items-center space-x-3">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-text-main-dark">
                        Knowledge Hub
                    </h1>
                    <div className="h-6 w-px bg-slate-200 dark:bg-border-dark mx-2" />
                    <nav className="flex space-x-4 text-sm font-medium text-slate-500">
                        <span className="text-primary border-b-2 border-primary pb-4 -mb-4">Collections</span>
                        <span className="hover:text-primary cursor-pointer pb-4 -mb-4">All Notes</span>
                        <span className="hover:text-primary cursor-pointer pb-4 -mb-4">Visualization</span>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <Button variant="primary" onClick={onCreateCollection}>
                        <span className="material-icons-round text-xs mr-1">add</span>
                        New Collection
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full py-10 px-8">
                <header className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-text-main-dark mb-2">
                        Note Collections
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Organize and manage your specialized knowledge bases.
                    </p>
                </header>

                {/* Placeholder for collection cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 h-48 flex items-center justify-center text-slate-400">
                        Collection cards will go here
                    </div>
                </div>
            </div>

            <FloatingActionButton />
        </>
    )
}
