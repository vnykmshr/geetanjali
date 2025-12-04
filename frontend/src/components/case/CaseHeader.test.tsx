import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { CaseHeader } from './CaseHeader'
import { mockCase } from '../../test/fixtures'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('CaseHeader', () => {
  const defaultProps = {
    caseData: mockCase,
    canSave: true,
    canDelete: true,
    canShare: true,
    shareLoading: false,
    showShareDropdown: false,
    copySuccess: false,
    onSave: vi.fn(),
    onDeleteClick: vi.fn(),
    onToggleShareDropdown: vi.fn(),
    onToggleShare: vi.fn(),
    onCopyShareLink: vi.fn(),
  }

  it('should render back link', () => {
    renderWithRouter(<CaseHeader {...defaultProps} />)

    const backLink = screen.getByText('← Back')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/consultations')
  })

  describe('Save button', () => {
    it('should render save button when canSave is true', () => {
      renderWithRouter(<CaseHeader {...defaultProps} />)

      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('should not render save button when canSave is false', () => {
      renderWithRouter(<CaseHeader {...defaultProps} canSave={false} />)

      expect(screen.queryByText('Save')).not.toBeInTheDocument()
    })

    it('should call onSave when clicked', () => {
      const onSave = vi.fn()
      renderWithRouter(<CaseHeader {...defaultProps} onSave={onSave} />)

      fireEvent.click(screen.getByText('Save'))
      expect(onSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('Delete button', () => {
    it('should render delete button when canDelete is true', () => {
      renderWithRouter(<CaseHeader {...defaultProps} />)

      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should not render delete button when canDelete is false', () => {
      renderWithRouter(<CaseHeader {...defaultProps} canDelete={false} />)

      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })

    it('should call onDeleteClick when clicked', () => {
      const onDeleteClick = vi.fn()
      renderWithRouter(<CaseHeader {...defaultProps} onDeleteClick={onDeleteClick} />)

      fireEvent.click(screen.getByText('Delete'))
      expect(onDeleteClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Share button', () => {
    it('should render share button when canShare is true', () => {
      renderWithRouter(<CaseHeader {...defaultProps} />)

      expect(screen.getByText('Share')).toBeInTheDocument()
    })

    it('should not render share button when canShare is false', () => {
      renderWithRouter(<CaseHeader {...defaultProps} canShare={false} />)

      expect(screen.queryByText('Share')).not.toBeInTheDocument()
    })

    it('should show "Shared" text when case is public', () => {
      renderWithRouter(
        <CaseHeader {...defaultProps} caseData={{ ...mockCase, is_public: true }} />
      )

      expect(screen.getByText('Shared')).toBeInTheDocument()
    })

    it('should call onToggleShareDropdown when clicked', () => {
      const onToggleShareDropdown = vi.fn()
      renderWithRouter(<CaseHeader {...defaultProps} onToggleShareDropdown={onToggleShareDropdown} />)

      fireEvent.click(screen.getByText('Share'))
      expect(onToggleShareDropdown).toHaveBeenCalledTimes(1)
    })
  })

  describe('Share dropdown', () => {
    it('should show dropdown when showShareDropdown is true', () => {
      renderWithRouter(<CaseHeader {...defaultProps} showShareDropdown={true} />)

      expect(screen.getByText('Public sharing')).toBeInTheDocument()
      expect(screen.getByText('Anyone with link can view')).toBeInTheDocument()
    })

    it('should not show dropdown when showShareDropdown is false', () => {
      renderWithRouter(<CaseHeader {...defaultProps} showShareDropdown={false} />)

      expect(screen.queryByText('Public sharing')).not.toBeInTheDocument()
    })

    it('should show toggle in enabled state when case is public', () => {
      renderWithRouter(
        <CaseHeader
          {...defaultProps}
          showShareDropdown={true}
          caseData={{ ...mockCase, is_public: true, public_slug: 'abc123' }}
        />
      )

      expect(screen.getByText('Share link')).toBeInTheDocument()
    })

    it('should show private notice when case is not public', () => {
      renderWithRouter(
        <CaseHeader {...defaultProps} showShareDropdown={true} caseData={{ ...mockCase, is_public: false }} />
      )

      expect(screen.getByText('Turn on to create a shareable link')).toBeInTheDocument()
    })

    it('should show copy success text when copy succeeds', () => {
      renderWithRouter(
        <CaseHeader
          {...defaultProps}
          showShareDropdown={true}
          copySuccess={true}
          caseData={{ ...mockCase, is_public: true, public_slug: 'abc123' }}
        />
      )

      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })
})
