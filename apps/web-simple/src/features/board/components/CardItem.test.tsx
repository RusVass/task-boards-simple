import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Card } from '../board.types'
import { BoardProvider } from '../board.context'
import { CardItem } from './CardItem'

const defaultCard: Card = {
  id: '1',
  boardId: 'board-1',
  title: 'Test title',
  description: 'Test description',
  column: 'todo',
  order: 0,
}

const handleDragStart = () => {}
const handleDropOnCard = () => {}
const handleDragOverCard = () => {}

const renderCardItem = (card: Card) =>
  render(
    <MemoryRouter>
      <BoardProvider>
        <CardItem
          card={card}
          onDragStart={handleDragStart}
          onDropOnCard={handleDropOnCard}
          onDragOverCard={handleDragOverCard}
        />
      </BoardProvider>
    </MemoryRouter>,
  )

describe('CardItem', () => {
  it('renders title, description and action buttons', () => {
    renderCardItem(defaultCard)

    expect(screen.getByText('Test title')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('hides description when it is empty', () => {
    renderCardItem({ ...defaultCard, description: '' })

    expect(screen.getByText('Test title')).toBeInTheDocument()
    expect(screen.queryByText('Test description')).not.toBeInTheDocument()
  })

  it('does not render inputs in view mode', () => {
    renderCardItem(defaultCard)

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
