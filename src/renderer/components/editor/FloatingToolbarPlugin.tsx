import { useEffect, useState, useCallback, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    $isRangeSelection,
    $createTextNode,
    $getNodeByKey,
    $isTextNode,
    $createRangeSelection,
    $setSelection,
    FORMAT_TEXT_COMMAND,
    TextFormatType,
    RangeSelection,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $createParagraphNode, $isParagraphNode } from 'lexical';
import { FloatingToolbar, ToolbarAction, SubmenuItem } from './FloatingToolbar';
import { $createLoadingIndicatorNode, $isLoadingIndicatorNode } from './nodes/LoadingIndicatorNode';

const SHOW_DELAY_MS = 200;
const TOOLBAR_OFFSET_Y = 10;

/**
 * FloatingToolbarPlugin
 * A Lexical plugin that shows a floating toolbar when text is selected.
 * Handles selection detection, position calculation, and formatting commands.
 */
export function FloatingToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [activeFormats, setActiveFormats] = useState<Set<TextFormatType>>(new Set());
    const [currentHeadingType, setCurrentHeadingType] = useState<string | null>(null);
    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Calculate toolbar position based on selection
    const updatePosition = useCallback(() => {
        const nativeSelection = window.getSelection();
        if (!nativeSelection || nativeSelection.rangeCount === 0) return;

        const range = nativeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Position above the selection, centered
        setPosition({
            top: rect.top + window.scrollY - TOOLBAR_OFFSET_Y - 40,
            left: rect.left + window.scrollX + rect.width / 2,
        });
    }, []);

    // Check if selection has text
    const hasTextSelection = useCallback(() => {
        const nativeSelection = window.getSelection();
        if (!nativeSelection || nativeSelection.rangeCount === 0) return false;
        return nativeSelection.toString().trim().length > 0;
    }, []);

    // Show toolbar with delay
    const showToolbar = useCallback(() => {
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
        }
        showTimeoutRef.current = setTimeout(() => {
            if (hasTextSelection()) {
                updatePosition();
                setIsVisible(true);
            }
        }, SHOW_DELAY_MS);
    }, [hasTextSelection, updatePosition]);

    // Hide toolbar
    const hideToolbar = useCallback(() => {
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
            showTimeoutRef.current = null;
        }
        setIsVisible(false);
    }, []);

    // Listen to selection changes
    useEffect(() => {
        const unregister = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                    // Track active formats
                    const formats = new Set<TextFormatType>();
                    if (selection.hasFormat('bold')) formats.add('bold');
                    if (selection.hasFormat('italic')) formats.add('italic');
                    if (selection.hasFormat('underline')) formats.add('underline');
                    if (selection.hasFormat('strikethrough')) formats.add('strikethrough');
                    setActiveFormats(formats);

                    // Track current heading type
                    const anchorNode = selection.anchor.getNode();
                    const element = anchorNode.getTopLevelElement();
                    if ($isHeadingNode(element)) {
                        setCurrentHeadingType(element.getTag());
                    } else {
                        setCurrentHeadingType(null);
                    }

                    showToolbar();
                } else {
                    hideToolbar();
                }
            });
        });

        return () => {
            unregister();
            if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
            }
        };
    }, [editor, showToolbar, hideToolbar]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Don't close if clicking on the toolbar itself
            const target = event.target as Node;
            const toolbar = document.querySelector('[data-floating-toolbar]');
            if (toolbar && toolbar.contains(target)) {
                return;
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                hideToolbar();
            }
        };

        const handleScroll = () => {
            if (isVisible) {
                updatePosition();
            }
        };

        document.addEventListener('keydown', handleEscape);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('keydown', handleEscape);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isVisible, hideToolbar, updatePosition]);

    // Format text command
    const formatText = useCallback((format: TextFormatType) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    }, [editor]);

    // Set heading to specific type
    const setHeading = useCallback((headingType: HeadingTagType | 'paragraph') => {
        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            if (headingType === 'paragraph') {
                $setBlocksType(selection, () => $createParagraphNode());
            } else {
                $setBlocksType(selection, () => $createHeadingNode(headingType));
            }
        });
    }, [editor]);

    // Heading submenu items
    const headingSubmenuItems: SubmenuItem[] = [
        {
            id: 'h1',
            label: 'Heading 1',
            onClick: () => setHeading('h1'),
            isActive: currentHeadingType === 'h1',
        },
        {
            id: 'h2',
            label: 'Heading 2',
            onClick: () => setHeading('h2'),
            isActive: currentHeadingType === 'h2',
        },
        {
            id: 'h3',
            label: 'Heading 3',
            onClick: () => setHeading('h3'),
            isActive: currentHeadingType === 'h3',
        },
        {
            id: 'h4',
            label: 'Heading 4',
            onClick: () => setHeading('h4'),
            isActive: currentHeadingType === 'h4',
        },
        {
            id: 'h5',
            label: 'Heading 5',
            onClick: () => setHeading('h5'),
            isActive: currentHeadingType === 'h5',
        },
        {
            id: 'h6',
            label: 'Heading 6',
            onClick: () => setHeading('h6'),
            isActive: currentHeadingType === 'h6',
        },
        {
            id: 'paragraph',
            label: 'Paragraph',
            onClick: () => setHeading('paragraph'),
            isActive: currentHeadingType === null,
        },
    ];

    // Define formatting actions
    const formattingActions: ToolbarAction[] = [
        {
            id: 'bold',
            label: 'Bold',
            shortLabel: 'B',
            onClick: () => formatText('bold'),
            isActive: activeFormats.has('bold'),
        },
        {
            id: 'italic',
            label: 'Italic',
            shortLabel: 'I',
            onClick: () => formatText('italic'),
            isActive: activeFormats.has('italic'),
        },
        {
            id: 'heading',
            label: 'Text Style',
            shortLabel: 'T',
            onClick: () => { },
            hasSubmenu: true,
            submenuItems: headingSubmenuItems,
            isActive: currentHeadingType !== null,
        },
    ];

    // Define AI actions (placeholders for now)
    const [availableActions, setAvailableActions] = useState<any[]>([]);
    const [executingActionId, setExecutingActionId] = useState<string | null>(null);

    // Fetch actions on mount
    useEffect(() => {
        const loadActions = async () => {
            try {
                if (window.matriarch?.aiActions) {
                    const actions = await window.matriarch.aiActions.list();
                    setAvailableActions(actions.filter(a => a.enabled));
                }
            } catch (error) {
                console.error("Failed to load AI actions", error);
            }
        };
        loadActions();
    }, []);

    const handleExecuteAIAction = useCallback(async (action: any) => {
        if (executingActionId) return;
        setExecutingActionId(action.id);
        setIsVisible(false);

        let loadingNodeKey: string | null = null;
        let textContent = '';

        try {
            editor.getEditorState().read(() => {
                const selection = $getSelection();
                if (selection) textContent = selection.getTextContent();
            });

            console.log(`Executing AI action ${action.id} on text length ${textContent.length}`);

            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    // Insert at end of selection without changing selection content
                    // 1. Capture original selection points to restore later
                    const anchorKey = selection.anchor.key;
                    const anchorOffset = selection.anchor.offset;
                    const anchorType = selection.anchor.type;
                    const focusKey = selection.focus.key;
                    const focusOffset = selection.focus.offset;
                    const focusType = selection.focus.type;
                    const isBackward = selection.isBackward();

                    // 2. Collapse to end
                    // If backward, anchor is the end (visually right). If forward, focus is end.
                    // Wait, standard: if backward (focus < anchor), start is focus, end is anchor.
                    // if forward (anchor <= focus), start is anchor, end is focus.
                    const endPoint = isBackward ? selection.anchor : selection.focus;

                    // Manually move both points to end to collapse
                    selection.anchor.set(endPoint.key, endPoint.offset, endPoint.type);
                    selection.focus.set(endPoint.key, endPoint.offset, endPoint.type);

                    // 3. Insert Loading Node (collapsed at end)
                    const loadingNode = $createLoadingIndicatorNode();
                    selection.insertNodes([loadingNode]);

                    // 4. Restore Selection (Robust Method)
                    try {
                        // We need to restore the selection to the original anchor/focus points.
                        // Since we inserted a node *after* (collapsed at end), the original nodes 
                        // should logically still exist, though offsets might shift if we inserted *inside* a text node.
                        // But we captured keys/offsets *before* any modification.

                        // Create a new range selection
                        const newSelection = $createRangeSelection();
                        newSelection.anchor.set(anchorKey, anchorOffset, anchorType);
                        newSelection.focus.set(focusKey, focusOffset, focusType);

                        // Apply it
                        $setSelection(newSelection);
                    } catch (err) {
                        console.warn("Failed to restore selection after spinner insert", err);
                    }

                    loadingNodeKey = loadingNode.getKey();
                }
            });

            const result = await window.matriarch.aiActions.execute(action.id, textContent);

            editor.update(() => {
                if (loadingNodeKey) {
                    const node = $getNodeByKey(loadingNodeKey);
                    if (node) node.remove();
                }

                if (result.success && result.output) {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        if (action.outputBehavior === 'replace') {
                            selection.insertText(result.output);
                        } else if (action.outputBehavior === 'append') {
                            // Collapse to end manually
                            const isBackward = selection.isBackward();
                            const endPoint = isBackward ? selection.anchor : selection.focus;
                            selection.anchor.set(endPoint.key, endPoint.offset, endPoint.type);
                            selection.focus.set(endPoint.key, endPoint.offset, endPoint.type);

                            selection.insertText(result.output);
                        } else if (action.outputBehavior === 'insert_below') {
                            const anchorNode = selection.anchor.getNode();
                            const topLevelBlock = anchorNode.getTopLevelElement();

                            if (topLevelBlock) {
                                const newP = $createParagraphNode();
                                newP.append($createTextNode(result.output));
                                topLevelBlock.insertAfter(newP);
                                newP.select();
                            }
                        }
                    }
                } else {
                    console.error('AI Action failed:', result.error);
                }
                setExecutingActionId(null);
            });

        } catch (e) {
            console.error(e);
            setExecutingActionId(null);
            editor.update(() => {
                if (loadingNodeKey) {
                    const node = $getNodeByKey(loadingNodeKey);
                    if (node) node.remove();
                }
            });
        }
    }, [editor, executingActionId]);

    // Define AI actions
    const aiActions: ToolbarAction[] = availableActions.length > 0 ? [
        {
            id: 'ai_actions_menu',
            label: executingActionId ? 'Running...' : 'AI Actions',
            icon: executingActionId ? 'hourglass_empty' : 'auto_awesome',
            onClick: () => { },
            disabled: !!executingActionId,
            hasSubmenu: true,
            submenuItems: availableActions.map(action => ({
                id: action.id,
                label: action.name,
                onClick: () => handleExecuteAIAction(action),
                isActive: false
            }))
        }
    ] : [];

    if (!isVisible) return null;

    return (
        <div data-floating-toolbar>
            <FloatingToolbar
                position={position}
                formattingActions={formattingActions}
                aiActions={aiActions}
                onClose={hideToolbar}
            />
        </div>
    );
}
