import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function for merging Tailwind CSS classes conditionally.
 * Combines clsx for conditional classes with tailwind-merge to handle conflicts.
 * 
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary', className)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
