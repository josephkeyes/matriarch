import { useEffect, useState, useCallback, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    $isRangeSelection,
    $createTextNode,
    FORMAT_TEXT_COMMAND,
    TextFormatType,
    RangeSelection,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $createParagraphNode } from 'lexical';
import { FloatingToolbar, ToolbarAction, SubmenuItem } from './FloatingToolbar';

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
    const aiActions: ToolbarAction[] = [
        {
            id: 'summarize',
            label: 'Summarize',
            icon: 'auto_awesome',
            onClick: () => console.log('Summarize clicked'),
            disabled: true,
        },
        {
            id: 'categorize',
            label: 'Categorize',
            icon: 'label',
            onClick: () => console.log('Categorize clicked'),
            disabled: true,
        },
        {
            id: 'expand',
            label: 'Expand',
            icon: 'add_circle',
            onClick: () => console.log('Expand clicked'),
            disabled: true,
        },
        {
            id: 'proof',
            label: 'Proof',
            icon: 'spellcheck',
            onClick: () => console.log('Proof clicked'),
            disabled: true,
        },
    ];

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
