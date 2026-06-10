import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClueList from '../../src/components/ClueList';

const mockClues = [
  { number: 1, direction: 'across', clue: 'apple', context: 'Der ___ ist rot.', level: 'A1', word: 'APFEL', row: 0, col: 0 },
  { number: 2, direction: 'across', clue: 'house', context: 'Das ___ ist groß.', level: 'A1', word: 'HAUS', row: 2, col: 0 },
  { number: 1, direction: 'down', clue: 'car', context: 'Das ___ ist schnell.', level: 'A2', word: 'AUTO', row: 0, col: 0 },
];

describe('ClueList', () => {
  it('renders Across and Down tabs', () => {
    render(<ClueList clues={mockClues} activeClue={null} onClueClick={() => {}} completedWords={[]} />);
    expect(screen.getByText('Across')).toBeInTheDocument();
    expect(screen.getByText('Down')).toBeInTheDocument();
  });

  it('shows clues for the selected tab', () => {
    render(<ClueList clues={mockClues} activeClue={null} onClueClick={() => {}} completedWords={[]} />);
    expect(screen.getByText(/apple/)).toBeInTheDocument();
    expect(screen.getByText(/house/)).toBeInTheDocument();
  });

  it('calls onClueClick when a clue is tapped', () => {
    const handleClick = vi.fn();
    render(<ClueList clues={mockClues} activeClue={null} onClueClick={handleClick} completedWords={[]} />);
    fireEvent.click(screen.getByText(/apple/));
    expect(handleClick).toHaveBeenCalledWith(mockClues[0]);
  });

  it('switches tabs when Down is clicked', () => {
    render(<ClueList clues={mockClues} activeClue={null} onClueClick={() => {}} completedWords={[]} />);
    fireEvent.click(screen.getByText('Down'));
    expect(screen.getByText(/car/)).toBeInTheDocument();
  });
});
