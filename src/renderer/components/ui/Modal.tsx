
import { useEffect, useRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { Button } from './Button'

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    description?: string
    children: ReactNode
    footer?: ReactNode
}

export function Modal({ isOpen, onClose, title, description, children, footer }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className={cn(
                    "relative w-full max-w-lg transform rounded-xl bg-white dark:bg-surface-dark",
                    "border border-slate-200 dark:border-border-dark shadow-2xl transition-all",
                    "p-6 text-left align-middle"
                )}
            >
                {(title || description) && (
                    <div className="mb-4">
                        {title && (
                            <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-text-main-dark">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="mt-1 text-sm text-slate-500 dark:text-text-secondary-dark">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-2">
                    {children}
                </div>

                {footer && (
                    <div className="mt-6 flex justify-end space-x-3">
                        {footer}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-500 dark:hover:text-text-main-dark transition-colors"
                >
                    <span className="material-icons-round text-lg">close</span>
                </button>
            </div>
        </div>,
        document.body
    )
}
