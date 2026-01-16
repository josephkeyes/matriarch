
import { useEffect, useState, useCallback, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { Note } from '../../shared/api/contracts';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { FloatingToolbarPlugin } from './editor/FloatingToolbarPlugin';

// Theme configuration
const theme = {
    heading: {
        h1: 'text-3xl font-bold mb-4 text-slate-800 dark:text-slate-100',
        h2: 'text-2xl font-bold mb-3 text-slate-800 dark:text-slate-100',
        h3: 'text-xl font-bold mb-2 text-slate-800 dark:text-slate-100',
    },
    paragraph: 'mb-4 text-slate-700 dark:text-slate-300',
    text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
    },
    quote: 'border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic text-slate-600 dark:text-slate-400',
    list: {
        ul: 'list-disc list-inside mb-4 text-slate-700 dark:text-slate-300',
        ol: 'list-decimal list-inside mb-4 text-slate-700 dark:text-slate-300',
    },
    code: 'bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5 font-mono text-sm',
    link: 'text-primary hover:underline',
};

// Plugin to load markdown content
function MarkdownLoaderPlugin({ markdown }: { markdown: string }) {
    const [editor] = useLexicalComposerContext();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Only load if not already loaded to prevent overwriting user edits on re-renders
        // or if noteId changed (handled by parent unmounting/remounting)
        if (!isLoaded && markdown) {
            editor.update(() => {
                $convertFromMarkdownString(markdown, TRANSFORMERS);
            });
            setIsLoaded(true);
        }
    }, [markdown, editor, isLoaded]);

    return null;
}

interface NoteViewProps {
    noteId: string;
    onNoteUpdate?: () => void;
}

export function NoteView({ noteId, onNoteUpdate }: NoteViewProps) {
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Save timeout ref
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        async function loadNote() {
            if (!noteId) return;
            setLoading(true);
            setError(null);
            try {
                if (window.matriarch?.notes) {
                    const data = await window.matriarch.notes.read(noteId);
                    setNote(data);
                } else {
                    setError("API not available");
                }
            } catch (e) {
                console.error("Failed to load note", e);
                setError("Failed to load note");
            } finally {
                setLoading(false);
            }
        }
        loadNote();

        // Cleanup save timeout
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [noteId]);

    const handleUpdate = useCallback(async (updates: { content?: string, title?: string }) => {
        if (!noteId || !window.matriarch?.notes) return;

        setIsSaving(true);
        try {
            await window.matriarch.notes.update(noteId, updates);
            // Update local state for immediate UI feedback if needed
            setNote(prev => prev ? { ...prev, ...updates } : null);
            // Notify parent if title changed (to refresh sidebar)
            if (updates.title && onNoteUpdate) {
                onNoteUpdate();
            }
        } catch (e) {
            console.error("Failed to save note:", e);
        } finally {
            setIsSaving(false);
        }
    }, [noteId, onNoteUpdate]);

    const onChange = useCallback((editorState: any, editor: any) => {
        editorState.read(() => {
            // Convert to markdown
            const markdown = $convertToMarkdownString(TRANSFORMERS);

            // Debounce save
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => {
                handleUpdate({ content: markdown });
            }, 1000); // Auto-save after 1 second of inactivity
        });
    }, [handleUpdate]);

    const handleTitleBlur = useCallback((e: React.FocusEvent<HTMLHeadingElement>) => {
        const newTitle = e.currentTarget.textContent || 'Untitled Note';
        if (note?.title !== newTitle) {
            handleUpdate({ title: newTitle });
        }
    }, [note?.title, handleUpdate]);

    const initialConfig = {
        namespace: 'NoteView',
        theme,
        onError(error: any) {
            console.error(error);
        },
        nodes: [
            HeadingNode,
            QuoteNode,
            CodeNode,
            ListNode,
            ListItemNode,
            LinkNode
        ],
        editable: true,
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <span className="material-icons-round animate-spin text-slate-400 text-3xl">refresh</span>
            </div>
        );
    }

    if (error || !note) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-slate-400">
                <span className="material-icons-round text-4xl mb-2">error_outline</span>
                <p>{error || "Note not found"}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-background-dark animate-fade-in">
            {/* Note Header */}
            <div className="px-8 py-5 border-b border-slate-100 dark:border-border-dark flex items-center justify-between sticky top-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md z-10">
                <div>
                    <h1
                        className="text-2xl font-bold text-slate-900 dark:text-text-main-dark tracking-tight outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 -ml-1 transition-all"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={handleTitleBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                e.currentTarget.blur();
                            }
                        }}
                    >
                        {note.title}
                    </h1>
                    <p className="text-xs text-slate-400 dark:text-text-secondary-dark mt-1 flex items-center gap-2">
                        <span className="material-icons-round text-[14px]">calendar_today</span>
                        <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
                        {isSaving && <span className="text-primary italic ml-2">Saving...</span>}
                    </p>
                </div>
                {/* Actions placeholder */}
                <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <span className="material-icons-round">edit</span>
                    </button>
                    <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <span className="material-icons-round">more_vert</span>
                    </button>
                </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    <LexicalComposer initialConfig={initialConfig}>
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable
                                    className="outline-none min-h-[calc(100vh-200px)] text-lg text-slate-700 dark:text-slate-300 leading-relaxed"
                                />
                            }
                            placeholder={<div className="text-slate-300 absolute top-0 pointer-events-none">Start typing...</div>}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <MarkdownLoaderPlugin markdown={note.content || ''} />
                        <OnChangePlugin onChange={onChange} />
                        <HistoryPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                        <FloatingToolbarPlugin />
                    </LexicalComposer>
                </div>
            </div>
        </div>
    );
}
