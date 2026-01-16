import { useState, useEffect } from 'react'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'

interface OllamaConfig {
    baseUrl: string
    defaultModel: string
}

interface OllamaConfigPanelProps {
    config: OllamaConfig
    onSave: (config: OllamaConfig) => void
    onTestConnection: () => Promise<{ available: boolean; error?: string; models?: string[] }>
}

/**
 * Configuration panel for Ollama provider.
 */
export function OllamaConfigPanel({
    config,
    onSave,
    onTestConnection,
}: OllamaConfigPanelProps) {
    const [baseUrl, setBaseUrl] = useState(config.baseUrl)
    const [defaultModel, setDefaultModel] = useState(config.defaultModel)
    const [availableModels, setAvailableModels] = useState<string[]>([])
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

    // Track changes
    useEffect(() => {
        const changed = baseUrl !== config.baseUrl || defaultModel !== config.defaultModel
        setHasChanges(changed)
    }, [baseUrl, defaultModel, config])

    const handleTestConnection = async () => {
        setConnectionStatus('testing')
        setErrorMessage(null)

        try {
            const result = await onTestConnection()
            if (result.available) {
                setConnectionStatus('success')
                if (result.models) {
                    setAvailableModels(result.models)
                }
            } else {
                setConnectionStatus('error')
                setErrorMessage(result.error ?? 'Connection failed')
            }
        } catch (err) {
            setConnectionStatus('error')
            setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
        }
    }

    const handleSave = () => {
        onSave({ baseUrl, defaultModel })
        setHasChanges(false)
    }

    return (
        <div className="space-y-5">
            {/* Base URL */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Ollama Server URL
                </label>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="http://localhost:11434"
                        className="flex-1 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm px-4 py-2.5 text-slate-900 dark:text-text-main-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    />
                    <Button
                        variant="secondary"
                        onClick={handleTestConnection}
                        disabled={connectionStatus === 'testing'}
                    >
                        {connectionStatus === 'testing' ? (
                            <span className="flex items-center">
                                <span className="animate-spin material-icons-round text-sm mr-1">refresh</span>
                                Testing...
                            </span>
                        ) : (
                            'Test Connection'
                        )}
                    </Button>
                </div>

                {/* Connection Status */}
                {connectionStatus === 'success' && (
                    <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
                        <span className="material-icons-round text-sm mr-1">check_circle</span>
                        Connected successfully
                        {availableModels.length > 0 && ` (${availableModels.length} models available)`}
                    </p>
                )}
                {connectionStatus === 'error' && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center">
                        <span className="material-icons-round text-sm mr-1">error</span>
                        {errorMessage}
                    </p>
                )}
            </div>

            {/* Default Model */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Default Model
                </label>
                {availableModels.length > 0 ? (
                    <select
                        value={defaultModel}
                        onChange={(e) => setDefaultModel(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm px-4 py-2.5 text-slate-900 dark:text-text-main-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    >
                        {availableModels.map((model) => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        value={defaultModel}
                        onChange={(e) => setDefaultModel(e.target.value)}
                        placeholder="llama3.2"
                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm px-4 py-2.5 text-slate-900 dark:text-text-main-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    />
                )}
                <p className="mt-1 text-[10px] text-slate-400">
                    {availableModels.length > 0
                        ? 'Select from available models on your Ollama server'
                        : 'Test connection to load available models, or enter model name manually'
                    }
                </p>
            </div>

            {/* Save Button */}
            {hasChanges && (
                <div className="flex justify-end pt-2">
                    <Button variant="primary" onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    )
}
