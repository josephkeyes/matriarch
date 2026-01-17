import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { AIAction, AIProviderInfo } from '../../../shared/api/contracts'

export function AIActionConfig() {
    const [actions, setActions] = useState<AIAction[]>([])
    const [providers, setProviders] = useState<AIProviderInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [editingAction, setEditingAction] = useState<Partial<AIAction> | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [actionsList, providersList] = await Promise.all([
                window.matriarch.aiActions.list(),
                window.matriarch.aiProviders.list()
            ])
            setActions(actionsList)
            setProviders(providersList.filter(p => p.enabled && p.available))
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this action?')) return
        try {
            await window.matriarch.aiActions.delete(id)
            setActions(prev => prev.filter(a => a.id !== id))
        } catch (error) {
            console.error('Failed to delete action:', error)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingAction) return

        try {
            if (editingAction.id) {
                // Update
                const updated = await window.matriarch.aiActions.update(editingAction.id, {
                    name: editingAction.name,
                    description: editingAction.description,
                    providerId: editingAction.providerId,
                    modelId: editingAction.modelId,
                    systemPrompt: editingAction.systemPrompt,
                    userPromptTemplate: editingAction.userPromptTemplate,
                    outputBehavior: editingAction.outputBehavior,
                    enabled: editingAction.enabled
                })
                setActions(prev => prev.map(a => a.id === updated.id ? updated : a))
            } else {
                // Create
                const created = await window.matriarch.aiActions.create({
                    name: editingAction.name!,
                    description: editingAction.description,
                    providerId: editingAction.providerId!,
                    modelId: editingAction.modelId!,
                    systemPrompt: editingAction.systemPrompt!,
                    userPromptTemplate: editingAction.userPromptTemplate!,
                    outputBehavior: editingAction.outputBehavior!,
                })
                setActions(prev => [...prev, created])
            }
            setEditingAction(null)
        } catch (error) {
            console.error('Failed to save action:', error)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading actions...</div>
    }

    if (editingAction) {
        return (
            <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-text-main-dark">
                        {editingAction.id ? 'Edit Action' : 'Create Action'}
                    </h3>
                    <Button variant="secondary" onClick={() => setEditingAction(null)}>Cancel</Button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Name</label>
                        <input
                            required
                            type="text"
                            value={editingAction.name || ''}
                            onChange={e => setEditingAction((prev: Partial<AIAction> | null) => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2"
                            placeholder="e.g. Summarize Note"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Provider & Model</label>
                        <div className="flex gap-4">
                            <select
                                required
                                value={editingAction.providerId || ''}
                                onChange={e => setEditingAction((prev: Partial<AIAction> | null) => ({ ...prev, providerId: e.target.value }))}
                                className="w-1/2 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2"
                            >
                                <option value="">Select Provider</option>
                                {providers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <input
                                required
                                type="text"
                                value={editingAction.modelId || ''}
                                onChange={e => setEditingAction(prev => ({ ...prev, modelId: e.target.value }))}
                                className="w-1/2 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2"
                                placeholder="Model ID (e.g. llama3)"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">System Prompt</label>
                        <textarea
                            required
                            value={editingAction.systemPrompt || ''}
                            onChange={e => setEditingAction((prev: Partial<AIAction> | null) => ({ ...prev, systemPrompt: e.target.value }))}
                            className="w-full h-24 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2 font-mono text-xs"
                            placeholder="System instructions for the model..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">User Prompt Template</label>
                        <p className="text-[10px] text-slate-400 mb-1">Use {'{{selection}}'} where the selected text should go.</p>
                        <textarea
                            required
                            value={editingAction.userPromptTemplate || ''}
                            onChange={e => setEditingAction((prev: Partial<AIAction> | null) => ({ ...prev, userPromptTemplate: e.target.value }))}
                            className="w-full h-24 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2 font-mono text-xs"
                            placeholder="Summarize this text: {{selection}}"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Output Behavior</label>
                        <select
                            required
                            value={editingAction.outputBehavior || 'replace'}
                            onChange={e => setEditingAction((prev: Partial<AIAction> | null) => ({ ...prev, outputBehavior: e.target.value as any }))}
                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2"
                        >
                            <option value="replace">Replace Selection</option>
                            <option value="append">Append After Selection</option>
                            <option value="insert_below">Insert Below Selection</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button type="submit" variant="primary">Save Action</Button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-text-main-dark">
                        AI Actions
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-text-secondary-dark">
                        Create custom actions to process text with AI.
                    </p>
                </div>
                <Button variant="primary" onClick={() => setEditingAction({ outputBehavior: 'replace', enabled: true })}>
                    <span className="material-icons-round text-sm mr-1">add</span>
                    Create Action
                </Button>
            </div>

            <div className="grid gap-4">
                {actions.map(action => (
                    <div key={action.id} className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-text-main-dark">{action.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 flex gap-2">
                                <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">{action.providerId}/{action.modelId}</span>
                                <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] capitalize">{action.outputBehavior.replace('_', ' ')}</span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditingAction(action)}
                                className="p-2 text-slate-400 hover:text-primary transition-colors"
                            >
                                <span className="material-icons-round">edit</span>
                            </button>
                            <button
                                onClick={() => handleDelete(action.id)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <span className="material-icons-round">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
                {actions.length === 0 && (
                    <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 dark:border-border-dark rounded-xl">
                        No actions created yet.
                    </div>
                )}
            </div>
        </div>
    )
}
