import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Grid from '../../src/components/Grid';

const mockGrid = [
  ['A', 'P', 'F', 'E', 'L'],
  [null, null, null, null, null],
  ['H', 'A', 'U', 'S', null],
];
const mockUserGrid = [['', '', '', '', ''],['', '', '', '', ''],['', '', '', '', '']];
const mockCellStatus = [[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null]];
const mockClues = [
  { number: 1, direction: 'across', word: 'APFEL', row: 0, col: 0 },
  { number: 2, direction: 'across', word: 'HAUS', row: 2, col: 0 },
];

describe('Grid', () => {
  it('renders correct number of cells', () => {
    const { container } = render(
      <Grid solutionGrid={mockGrid} userGrid={mockUserGrid} cellStatus={mockCellStatus}
        clues={mockClues} selectedCell={null} direction="across" activeClue={null} onCellClick={() => {}} />
    );
    const cells = container.querySelectorAll('.grid-cell');
    expect(cells.length).toBe(15);
  });

  it('calls onCellClick when a white cell is clicked', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Grid solutionGrid={mockGrid} userGrid={mockUserGrid} cellStatus={mockCellStatus}
        clues={mockClues} selectedCell={null} direction="across" activeClue={null} onCellClick={handleClick} />
    );
    const firstCell = container.querySelector('.grid-cell:not(.black)');
    fireEvent.click(firstCell);
    expect(handleClick).toHaveBeenCalled();
  });

  it('shows clue numbers on starting cells', () => {
    const { container } = render(
      <Grid solutionGrid={mockGrid} userGrid={mockUserGrid} cellStatus={mockCellStatus}
        clues={mockClues} selectedCell={null} direction="across" activeClue={null} onCellClick={() => {}} />
    );
    expect(container.textContent).toContain('1');
    expect(container.textContent).toContain('2');
  });
});
