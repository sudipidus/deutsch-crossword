import { useState, useCallback, useMemo } from 'react';

const MAX_HINTS = 3;
const PREFILL_RATIO = 0.5;

function buildPrefilled(grid, clues) {
  const userGrid = grid.map(row => row.map(cell => (cell !== null ? '' : null)));

  for (const clue of clues) {
    const len = clue.word.length;
    const indices = Array.from({ length: len }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const count = Math.max(1, Math.floor(len * PREFILL_RATIO));
    const toReveal = indices.slice(0, count);

    for (const idx of toReveal) {
      const r = clue.direction === 'across' ? clue.row : clue.row + idx;
      const c = clue.direction === 'across' ? clue.col + idx : clue.col;
      userGrid[r][c] = grid[r][c];
    }
  }

  return userGrid;
}

export function useGame(puzzle) {
  const { grid, clues } = puzzle;
  const rows = grid.length;
  const cols = grid[0].length;

  const initialUserGrid = useMemo(
    () => buildPrefilled(grid, clues),
    [grid, clues]
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

  const lockedCells = useMemo(() => {
    return initialUserGrid.map(row => row.map(cell => cell !== '' && cell !== null));
  }, [initialUserGrid]);

  const activeClue = useMemo(() => {
    if (!selectedCell) return null;
    const { row, col } = selectedCell;

    const findClue = (dir) =>
      clues.find(c => {
        if (c.direction !== dir) return false;
        if (dir === 'across') {
          return c.row === row && col >= c.col && col < c.col + c.word.length;
        }
        return c.col === col && row >= c.row && row < c.row + c.word.length;
      });

    return findClue(direction) || findClue(direction === 'across' ? 'down' : 'across') || null;
  }, [selectedCell, direction, clues]);

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

  const selectCell = useCallback((row, col, forceDirection) => {
    if (grid[row][col] === null) return;

    if (forceDirection) {
      setDirection(forceDirection);
    } else {
      setSelectedCell(prev => {
        if (prev && prev.row === row && prev.col === col) {
          setDirection(d => (d === 'across' ? 'down' : 'across'));
        }
        return { row, col };
      });
      return;
    }

    setSelectedCell({ row, col });
  }, [grid]);

  const inputLetter = useCallback((letter) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (lockedCells[row][col]) {
      const nextRow = direction === 'across' ? row : row + 1;
      const nextCol = direction === 'across' ? col + 1 : col;
      if (nextRow < rows && nextCol < cols && grid[nextRow][nextCol] !== null) {
        setSelectedCell({ row: nextRow, col: nextCol });
      }
      return;
    }

    const upper = letter.toUpperCase();
    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = upper;
      return next;
    });

    setSelectedCell(prev => {
      if (!prev) return prev;
      let nextRow = prev.row;
      let nextCol = prev.col;
      if (direction === 'across') {
        nextCol += 1;
      } else {
        nextRow += 1;
      }
      if (nextRow < rows && nextCol < cols && grid[nextRow][nextCol] !== null) {
        return { row: nextRow, col: nextCol };
      }
      return prev;
    });
  }, [selectedCell, direction, grid, rows, cols, lockedCells]);

  const deleteLetter = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (lockedCells[row][col]) return;

    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = '';
      return next;
    });

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
  }, [selectedCell, direction, grid, lockedCells]);

  const checkAnswers = useCallback(() => {
    setCellStatus(
      userGrid.map((row, r) =>
        row.map((cell, c) => {
          if (grid[r][c] === null) return null;
          if (cell === '') return null;
          if (lockedCells[r][c]) return 'correct';
          return cell === grid[r][c] ? 'correct' : 'wrong';
        })
      )
    );
  }, [userGrid, grid, lockedCells]);

  const revealLetter = useCallback(() => {
    if (!selectedCell) return;
    if (hintsUsed >= MAX_HINTS) return;

    const { row, col } = selectedCell;
    const correctLetter = grid[row][col];
    if (correctLetter === null) return;
    if (lockedCells[row][col]) return;

    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = correctLetter;
      return next;
    });
    setHintsUsed(prev => prev + 1);
  }, [selectedCell, hintsUsed, grid, lockedCells]);

  return {
    userGrid,
    cellStatus,
    selectedCell,
    direction,
    activeClue,
    hintsUsed,
    isComplete,
    lockedCells,
    selectCell,
    inputLetter,
    deleteLetter,
    checkAnswers,
    revealLetter,
  };
}
