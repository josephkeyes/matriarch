import { DecoratorNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { ReactNode, useEffect, useState } from 'react';

export class LoadingIndicatorNode extends DecoratorNode<ReactNode> {
    static getType(): string {
        return 'loading-indicator';
    }

    static clone(node: LoadingIndicatorNode): LoadingIndicatorNode {
        return new LoadingIndicatorNode(node.__key);
    }

    static importJSON(_serializedNode: SerializedLexicalNode): LoadingIndicatorNode {
        return new LoadingIndicatorNode();
    }

    exportJSON(): SerializedLexicalNode {
        return {
            type: 'loading-indicator',
            version: 1,
        };
    }

    createDOM(): HTMLElement {
        return document.createElement('span');
    }

    updateDOM(): boolean {
        return false;
    }

    decorate(): ReactNode {
        return <LoadingSpinner />;
    }
}

function LoadingSpinner() {
    const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setFrame(prev => (prev + 1) % spinnerChars.length);
        }, 80);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="inline-block mx-1 font-mono text-primary animate-pulse">
            {spinnerChars[frame]}
        </span>
    );
}

export function $createLoadingIndicatorNode(): LoadingIndicatorNode {
    return new LoadingIndicatorNode();
}

export function $isLoadingIndicatorNode(node: any): node is LoadingIndicatorNode {
    return node instanceof LoadingIndicatorNode;
}
