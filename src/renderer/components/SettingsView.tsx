import { useState, useEffect } from 'react'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'
import { SettingsToggle } from './ui/SettingsToggle'
import { ProviderCard } from './settings/ProviderCard'
import { OllamaConfigPanel } from './settings/OllamaConfigPanel'
import type { AIProviderInfo } from '../../shared/api/contracts'

// Settings navigation items
const settingsNavItems = [
    { id: 'general', label: 'General Preferences', icon: 'display_settings' },
    { id: 'ai', label: 'AI Configuration', icon: 'psychology' },
    { id: 'security', label: 'Security & Privacy', icon: 'security' },
    { id: 'api', label: 'API Integrations', icon: 'hub' },
    { id: 'billing', label: 'Billing & Usage', icon: 'payments' },
]

// AI Model options
const aiModelOptions = [
    { value: 'gpt-4o', label: 'GPT-4o (Default Professional)' },
    { value: 'claude-3.5', label: 'Claude 3.5 Sonnet (Creative Nuance)' },
    { value: 'gemini-1.5', label: 'Gemini 1.5 Pro (Massive Context)' },
    { value: 'llama-3', label: 'Local Llama 3 (Private/Offline)' },
]

interface SettingsViewProps {
    onClose?: () => void
}

export function SettingsView({ onClose }: SettingsViewProps) {
    // Navigation state
    const [activeSection, setActiveSection] = useState('ai')

    // AI Providers state
    const [providers, setProviders] = useState<AIProviderInfo[]>([])
    const [loadingProviders, setLoadingProviders] = useState(true)

    // Form state (UI only for now)
    const [autoNoteSummary, setAutoNoteSummary] = useState(true)
    const [backgroundMapping, setBackgroundMapping] = useState(false)
    const [selectedModel, setSelectedModel] = useState('gpt-4o')
    const [maxTokens, setMaxTokens] = useState('4096')
    const [temperature, setTemperature] = useState(50)

    // Load providers on mount
    useEffect(() => {
        loadProviders()
    }, [])

    const loadProviders = async () => {
        try {
            setLoadingProviders(true)
            const list = await window.matriarch.aiProviders.list()
            setProviders(list)
        } catch (error) {
            console.error('Failed to load providers:', error)
        } finally {
            setLoadingProviders(false)
        }
    }

    const handleProviderToggle = async (providerId: string, enabled: boolean) => {
        try {
            await window.matriarch.aiProviders.setEnabled(providerId, enabled)
            // Update local state
            setProviders(prev => prev.map(p =>
                p.id === providerId ? { ...p, enabled } : p
            ))
        } catch (error) {
            console.error('Failed to toggle provider:', error)
        }
    }

    const handleProviderConfigChange = async (providerId: string, config: Record<string, unknown>) => {
        try {
            await window.matriarch.aiProviders.updateConfig(providerId, config)
            // Update local state
            setProviders(prev => prev.map(p =>
                p.id === providerId ? { ...p, config } : p
            ))
        } catch (error) {
            console.error('Failed to update provider config:', error)
        }
    }

    const handleTestConnection = async (providerId: string) => {
        return await window.matriarch.aiProviders.checkAvailability(providerId)
    }

    return (
        <div className="flex h-full bg-white dark:bg-background-dark">
            {/* Left Sidebar - Quick Access */}
            <aside className="w-56 flex-shrink-0 border-r border-slate-200 dark:border-border-dark flex flex-col bg-white dark:bg-surface-dark overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-border-dark/50">
                    <h2 className="font-semibold text-xs tracking-wide text-slate-900 dark:text-text-main-dark uppercase">
                        Quick Access
                    </h2>
                    <span className="material-icons-round text-slate-400 text-sm cursor-pointer hover:text-primary transition-colors">
                        tune
                    </span>
                </div>

                {/* Navigation Items */}
                <div className="px-2 py-4 space-y-1 flex-1">
                    {settingsNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                'flex items-center space-x-2 px-3 py-2 rounded-md w-full text-left transition-colors',
                                activeSection === item.id
                                    ? 'bg-primary/5 dark:bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800'
                            )}
                        >
                            <span className={cn(
                                'material-icons-round text-sm',
                                activeSection === item.id ? 'text-primary' : 'text-slate-400'
                            )}>
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Usage Footer */}
                {/* <div className="p-4 border-t border-slate-100 dark:border-border-dark/50">
                    <div className="bg-slate-50 dark:bg-background-dark p-3 rounded-lg">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                            Power User Tier
                        </p>
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-700 dark:text-text-main-dark">94% API Usage</span>
                            <span className="text-primary cursor-pointer hover:underline">Upgrade</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2">
                            <div className="bg-primary h-1 rounded-full w-[94%]" />
                        </div>
                    </div>
                </div> */}
            </aside>

            {/* Main Content */}
            <section className="flex-1 flex flex-col bg-white dark:bg-background-dark overflow-hidden">
                {/* Header Bar */}
                <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-border-dark/50 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md z-40">
                    <div className="flex items-center space-x-3">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-text-main-dark">
                            Settings
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="secondary" onClick={onClose}>
                            Discard Changes
                        </Button>
                        <Button variant="primary">
                            Save Configuration
                        </Button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-4xl mx-auto space-y-10">
                        {/* AI Providers Section */}
                        <section>
                            <div className="flex items-center space-x-2 mb-6">
                                <span className="material-icons-round text-primary">hub</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-text-main-dark">
                                    AI Providers
                                </h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-text-secondary-dark mb-6">
                                Configure local and cloud AI providers. Providers are disabled by default.
                            </p>

                            {loadingProviders ? (
                                <div className="flex items-center justify-center py-8">
                                    <span className="animate-spin material-icons-round text-primary">refresh</span>
                                    <span className="ml-2 text-sm text-slate-500">Loading providers...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {providers.map((provider) => (
                                        <ProviderCard
                                            key={provider.id}
                                            provider={provider}
                                            onToggle={handleProviderToggle}
                                            onConfigChange={handleProviderConfigChange}
                                            onTestConnection={handleTestConnection}
                                        >
                                            {provider.id === 'ollama' && provider.config && (
                                                <OllamaConfigPanel
                                                    config={provider.config as { baseUrl: string; defaultModel: string }}
                                                    onSave={(config) => handleProviderConfigChange(provider.id, config as unknown as Record<string, unknown>)}
                                                    onTestConnection={() => handleTestConnection(provider.id)}
                                                />
                                            )}
                                        </ProviderCard>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* AI Task Automation Section */}
                        <section>
                            <div className="flex items-center space-x-2 mb-6">
                                <span className="material-icons-round text-primary">auto_fix_high</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-text-main-dark">
                                    AI Task Automation
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <SettingsToggle
                                    label="Autonomous Note Summary"
                                    description="Generate insights immediately after note creation."
                                    checked={autoNoteSummary}
                                    onChange={setAutoNoteSummary}
                                />
                                <SettingsToggle
                                    label="Background Relationship Mapping"
                                    description="Analyze cross-collection dependencies in real-time."
                                    checked={backgroundMapping}
                                    onChange={setBackgroundMapping}
                                />
                            </div>
                        </section>

                        {/* AI Model Selection Section */}
                        <section>
                            <div className="flex items-center space-x-2 mb-6">
                                <span className="material-icons-round text-accent-blue">model_training</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-text-main-dark">
                                    AI Model Selection
                                </h3>
                            </div>
                            <div className="space-y-6">
                                {/* Model Dropdown */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                        Primary reasoning engine
                                    </label>
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm px-4 py-2.5 text-slate-900 dark:text-text-main-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                                    >
                                        {aiModelOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Token Limit & Temperature */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                            Max Token Limit
                                        </label>
                                        <input
                                            type="number"
                                            value={maxTokens}
                                            onChange={(e) => setMaxTokens(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm px-4 py-2.5 text-slate-900 dark:text-text-main-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                            Temperature
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={temperature}
                                            onChange={(e) => setTemperature(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                            <span>Precise</span>
                                            <span>Creative</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* AI Routing Setup Section */}
                        <section>
                            <div className="flex items-center space-x-2 mb-6">
                                <span className="material-icons-round text-accent-purple">alt_route</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-text-main-dark">
                                    AI Routing Setup
                                </h3>
                            </div>

                            {/* Routing Rule Card */}
                            <div className="p-5 border-2 border-dashed border-slate-200 dark:border-border-dark rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-text-secondary-dark">
                                        Rule #1: High Complexity Task
                                    </span>
                                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-text-main-dark transition-colors">
                                        <span className="material-icons-round text-sm">more_vert</span>
                                    </button>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <span className="text-slate-500 dark:text-text-secondary-dark">
                                        If input length &gt; 10k then route to
                                    </span>
                                    <span className="font-mono text-primary bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded">
                                        Claude-3-Opus
                                    </span>
                                </div>
                            </div>

                            {/* Add Rule Button */}
                            <button className="mt-4 w-full py-2 border border-slate-200 dark:border-border-dark rounded-lg text-xs font-semibold text-slate-500 dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                + Add Routing Rule
                            </button>
                        </section>
                    </div>
                </div>
            </section>

            {/* <aside className="w-72 flex-shrink-0 border-l border-slate-200 dark:border-border-dark flex flex-col bg-white dark:bg-surface-dark overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-border-dark/50 bg-slate-50 dark:bg-background-dark">
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        System Status
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600 dark:text-text-secondary-dark">API Gateway</span>
                            <span className="flex items-center text-[10px] font-bold text-green-500">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                                OPERATIONAL
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600 dark:text-text-secondary-dark">Routing Latency</span>
                            <span className="text-[10px] font-mono text-slate-900 dark:text-text-main-dark">124ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600 dark:text-text-secondary-dark">Tokens Remaining</span>
                            <span className="text-[10px] font-mono text-slate-900 dark:text-text-main-dark">1.2M / 5M</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Recent Config Changes
                    </h2>
                    <div className="space-y-6">
                        <div className="relative pl-4 border-l border-slate-100 dark:border-border-dark">
                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary" />
                            <p className="text-[11px] font-semibold text-slate-900 dark:text-text-main-dark">
                                Primary model updated
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-text-secondary-dark mt-0.5">
                                GPT-4o → Claude-3.5
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">2 minutes ago</p>
                        </div>

                        <div className="relative pl-4 border-l border-slate-100 dark:border-border-dark">
                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <p className="text-[11px] font-semibold text-slate-900 dark:text-text-main-dark">
                                API Key Rotated
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-text-secondary-dark mt-0.5">
                                Admin-Primary-Key (System)
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">Yesterday, 14:20</p>
                        </div>

                        <div className="relative pl-4 border-l border-slate-100 dark:border-border-dark">
                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <p className="text-[11px] font-semibold text-slate-900 dark:text-text-main-dark">
                                Safety Filter Disabled
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-text-secondary-dark mt-0.5">
                                Strict → Relaxed (Creative Scope)
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">Sep 12, 09:15</p>
                        </div>
                    </div>
                </div>
            </aside>
             */}
        </div>
    )
}
