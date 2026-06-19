import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Play from '../../src/pages/Play';
import prebuilt from '../../src/data/prebuilt.json';

describe('Play', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the crossword grid and action buttons', () => {
    render(
      <MemoryRouter>
        <Play />
      </MemoryRouter>
    );
    expect(screen.getByText('Check')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText(/Show Clues/)).toBeInTheDocument();
  });

  it('typing a letter fills only the selected cell, not its neighbor', () => {
    // Deterministic prefill so the empty-cell layout is stable across runs.
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const { container } = render(
      <MemoryRouter initialEntries={['/?puzzle=puzzle-1']}>
        <Play />
      </MemoryRouter>
    );

    const { grid, clues } = prebuilt['puzzle-1'];
    const cols = grid[0].length;
    const cellEls = [...container.querySelectorAll('.grid-cell')];
    const at = (r, c) => cellEls[r * cols + c];
    const letterOf = (el) => el?.querySelector('.cell-letter')?.textContent ?? null;
    const isEmptyEditable = (el) =>
      el && !el.classList.contains('black') && !el.classList.contains('locked') &&
      letterOf(el) === '';

    // Find an across word with two consecutive empty editable cells, so a
    // double-write would visibly fill the cell to the right.
    let x = null, right = null;
    for (const clue of clues) {
      if (clue.direction !== 'across') continue;
      for (let i = 0; i < clue.word.length - 1; i++) {
        const a = at(clue.row, clue.col + i);
        const b = at(clue.row, clue.col + i + 1);
        if (isEmptyEditable(a) && isEmptyEditable(b)) { x = a; right = b; break; }
      }
      if (x) break;
    }
    expect(x, 'expected two consecutive empty across cells in puzzle-1').toBeTruthy();

    const hiddenInput = container.querySelector('.grid-hidden-input');
    fireEvent.click(x); // selects the cell (across) and focuses the hidden input

    // A real keypress on the focused input fires BOTH a bubbling keydown
    // (reaching Play's window listener) and an input event.
    fireEvent.keyDown(hiddenInput, { key: 'Q' });
    fireEvent.input(hiddenInput, { target: { value: 'Q' } });

    expect(letterOf(x)).toBe('Q');
    expect(letterOf(right)).toBe(''); // must NOT have been filled by a second write
  });
});
