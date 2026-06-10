import { useState, useCallback, useMemo, useRef } from 'react';

const MAX_HINTS = 3;
const PREFILL_RATIO = 0.5;
const CHECK_DISPLAY_MS = 3000;

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

// Build a map of which directions each cell belongs to
function buildCellDirections(grid, clues) {
  const rows = grid.length;
  const cols = grid[0].length;
  // Each cell gets a Set of directions ('across', 'down')
  const map = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Set())
  );

  for (const clue of clues) {
    for (let i = 0; i < clue.word.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      map[r][c].add(clue.direction);
    }
  }

  return map;
}

export function useGame(puzzle) {
  const { grid, clues } = puzzle;
  const rows = grid.length;
  const cols = grid[0].length;
  const checkTimerRef = useRef(null);

  const initialUserGrid = useMemo(
    () => buildPrefilled(grid, clues),
    [grid, clues]
  );

  const initialCellStatus = useMemo(
    () => grid.map(row => row.map(() => null)),
    [grid]
  );

  const cellDirections = useMemo(
    () => buildCellDirections(grid, clues),
    [grid, clues]
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
      // Explicit direction from clue click or nav arrows
      setDirection(forceDirection);
      setSelectedCell({ row, col });
      return;
    }

    const dirs = cellDirections[row][col];
    const hasAcross = dirs.has('across');
    const hasDown = dirs.has('down');

    setSelectedCell(prev => {
      const isSameCell = prev && prev.row === row && prev.col === col;

      if (isSameCell && hasAcross && hasDown) {
        // Intersection cell tapped again — toggle direction
        setDirection(d => (d === 'across' ? 'down' : 'across'));
      } else if (!isSameCell) {
        // New cell — auto-detect direction
        if (hasAcross && hasDown) {
          // Intersection — keep current direction
        } else if (hasAcross) {
          setDirection('across');
        } else if (hasDown) {
          setDirection('down');
        }
      }

      return { row, col };
    });
  }, [grid, cellDirections]);

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
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
    }

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

    checkTimerRef.current = setTimeout(() => {
      setCellStatus(grid.map(row => row.map(() => null)));
      checkTimerRef.current = null;
    }, CHECK_DISPLAY_MS);
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
