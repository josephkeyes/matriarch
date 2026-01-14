import { render, screen, fireEvent } from '@testing-library/react'
import { Tag } from './Tag'
import { describe, it, expect, vi } from 'vitest'

describe('Tag', () => {
    it('renders with default styles', () => {
        render(<Tag>Test Tag</Tag>)
        const tag = screen.getByText('Test Tag')
        expect(tag).toBeInTheDocument()
    })

    it('calls onRemove when remove button clicked', () => {
        const handleRemove = vi.fn()
        render(<Tag variant="removable" onRemove={handleRemove}>Removable</Tag>)
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(handleRemove).toHaveBeenCalled()
    })
})
