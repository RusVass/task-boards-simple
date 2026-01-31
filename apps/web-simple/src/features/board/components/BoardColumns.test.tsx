import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BoardProvider } from '../board.context'
import { BoardColumns } from './BoardColumns'

const renderBoardColumns = () =>
  render(
    <MemoryRouter>
      <BoardProvider>
        <BoardColumns />
      </BoardProvider>
    </MemoryRouter>,
  )

describe('BoardColumns', () => {
  it('shows add card form only in To Do column', () => {
    renderBoardColumns()

    const addButtons = screen.getAllByRole('button', { name: /add/i })
    expect(addButtons).toHaveLength(1)
  })

  it('renders all columns', () => {
    renderBoardColumns()

    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument()
  })
})
