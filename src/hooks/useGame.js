import { useState, useCallback, useMemo } from 'react';

const MAX_HINTS = 3;

export function useGame(puzzle) {
  const { grid, clues } = puzzle;
  const rows = grid.length;
  const cols = grid[0].length;

  // Build initial empty user grid ('' for playable cells, null for black cells)
  const initialUserGrid = useMemo(
    () => grid.map(row => row.map(cell => (cell !== null ? '' : null))),
    [grid]
  );

  const initialCellStatus = useMemo(
    () => grid.map(row => row.map(() => null)),
    [grid]
  );

  const [userGrid, setUserGrid] = useState(initialUserGrid);
  const [cellStatus, setCellStatus] = useState(initialCellStatus);
  const [selectedCell, setSelectedCell] = useState(null);
  const [direction, setDirection] = useState('across');
  const [hintsUsed, setHintsUsed] = useState(0);

  // Find active clue for the selected cell and direction
  const activeClue = useMemo(() => {
    if (!selectedCell) return null;
    const { row, col } = selectedCell;

    const findClue = (dir) =>
      clues.find(c => {
        if (c.direction !== dir) return false;
        if (dir === 'across') {
          return c.row === row && col >= c.col && col < c.col + c.word.length;
        }
        // down
        return c.col === col && row >= c.row && row < c.row + c.word.length;
      });

    return findClue(direction) || findClue(direction === 'across' ? 'down' : 'across') || null;
  }, [selectedCell, direction, clues]);

  // Check if puzzle is complete
  const isComplete = useMemo(() => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== null && userGrid[r][c] !== grid[r][c]) {
          return false;
        }
      }
    }
    return true;
  }, [userGrid, grid, rows, cols]);

  const selectCell = useCallback((row, col) => {
    // Ignore black cells
    if (grid[row][col] === null) return;

    setSelectedCell(prev => {
      // Toggle direction if selecting the same cell
      if (prev && prev.row === row && prev.col === col) {
        setDirection(d => (d === 'across' ? 'down' : 'across'));
      }
      return { row, col };
    });
  }, [grid]);

  const inputLetter = useCallback((letter) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const upper = letter.toUpperCase();

    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = upper;
      return next;
    });

    // Advance cursor in current direction
    setSelectedCell(prev => {
      if (!prev) return prev;
      let nextRow = prev.row;
      let nextCol = prev.col;
      if (direction === 'across') {
        nextCol += 1;
      } else {
        nextRow += 1;
      }
      // Stay in bounds and on playable cells
      if (nextRow < rows && nextCol < cols && grid[nextRow][nextCol] !== null) {
        return { row: nextRow, col: nextCol };
      }
      return prev;
    });
  }, [selectedCell, direction, grid, rows, cols]);

  const deleteLetter = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = '';
      return next;
    });

    // Move cursor backward
    setSelectedCell(prev => {
      if (!prev) return prev;
      let nextRow = prev.row;
      let nextCol = prev.col;
      if (direction === 'across') {
        nextCol -= 1;
      } else {
        nextRow -= 1;
      }
      if (nextRow >= 0 && nextCol >= 0 && grid[nextRow][nextCol] !== null) {
        return { row: nextRow, col: nextCol };
      }
      return prev;
    });
  }, [selectedCell, direction, grid]);

  const checkAnswers = useCallback(() => {
    setCellStatus(
      userGrid.map((row, r) =>
        row.map((cell, c) => {
          if (grid[r][c] === null) return null;
          if (cell === '') return null;
          return cell === grid[r][c] ? 'correct' : 'wrong';
        })
      )
    );
  }, [userGrid, grid]);

  const revealLetter = useCallback(() => {
    if (!selectedCell) return;
    if (hintsUsed >= MAX_HINTS) return;

    const { row, col } = selectedCell;
    const correctLetter = grid[row][col];
    if (correctLetter === null) return;

    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = correctLetter;
      return next;
    });
    setHintsUsed(prev => prev + 1);
  }, [selectedCell, hintsUsed, grid]);

  return {
    userGrid,
    cellStatus,
    selectedCell,
    direction,
    activeClue,
    hintsUsed,
    isComplete,
    selectCell,
    inputLetter,
    deleteLetter,
    checkAnswers,
    revealLetter,
  };
}
