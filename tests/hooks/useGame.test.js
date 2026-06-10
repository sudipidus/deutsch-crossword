import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../../src/hooks/useGame';

const mockPuzzle = {
  grid: [
    ['A', 'P', 'F', 'E', 'L'],
    [null, null, null, null, null],
    ['H', 'A', 'U', 'S', null],
  ],
  clues: [
    { number: 1, direction: 'across', clue: 'apple', context: 'Der ___ ist rot.', level: 'A1', word: 'APFEL', row: 0, col: 0, article: 'der' },
    { number: 2, direction: 'across', clue: 'house', context: 'Das ___ ist groß.', level: 'A1', word: 'HAUS', row: 2, col: 0, article: 'das' },
  ],
  placedWords: [],
};

describe('useGame', () => {
  it('initializes with partially prefilled grid', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    // Some cells should be prefilled, some empty
    const flatCells = result.current.userGrid.flat().filter(c => c !== null);
    const filled = flatCells.filter(c => c !== '');
    const empty = flatCells.filter(c => c === '');
    expect(filled.length).toBeGreaterThan(0);
    expect(empty.length).toBeGreaterThan(0);
    expect(result.current.selectedCell).toBe(null);
  });

  it('provides lockedCells matching prefilled positions', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    const { userGrid, lockedCells } = result.current;
    for (let r = 0; r < userGrid.length; r++) {
      for (let c = 0; c < userGrid[r].length; c++) {
        if (userGrid[r][c] !== null && userGrid[r][c] !== '') {
          expect(lockedCells[r][c]).toBe(true);
        }
      }
    }
  });

  it('selectCell sets the selected cell and active clue', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    act(() => { result.current.selectCell(0, 0); });
    expect(result.current.selectedCell).toEqual({ row: 0, col: 0 });
    expect(result.current.activeClue).not.toBe(null);
  });

  it('inputLetter skips locked cells', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    // Find a locked cell
    let lockedR = -1, lockedC = -1;
    for (let r = 0; r < result.current.lockedCells.length; r++) {
      for (let c = 0; c < result.current.lockedCells[r].length; c++) {
        if (result.current.lockedCells[r][c]) {
          lockedR = r; lockedC = c; break;
        }
      }
      if (lockedR >= 0) break;
    }
    if (lockedR >= 0) {
      const original = result.current.userGrid[lockedR][lockedC];
      act(() => { result.current.selectCell(lockedR, lockedC); });
      act(() => { result.current.inputLetter('X'); });
      // Locked cell should not change
      expect(result.current.userGrid[lockedR][lockedC]).toBe(original);
    }
  });

  it('inputLetter fills unlocked cells', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    // Find an unlocked cell
    let unlockedR = -1, unlockedC = -1;
    for (let r = 0; r < result.current.lockedCells.length; r++) {
      for (let c = 0; c < result.current.lockedCells[r].length; c++) {
        if (!result.current.lockedCells[r][c] && mockPuzzle.grid[r][c] !== null) {
          unlockedR = r; unlockedC = c; break;
        }
      }
      if (unlockedR >= 0) break;
    }
    if (unlockedR >= 0) {
      act(() => { result.current.selectCell(unlockedR, unlockedC); });
      act(() => { result.current.inputLetter('X'); });
      expect(result.current.userGrid[unlockedR][unlockedC]).toBe('X');
    }
  });

  it('checkAnswers marks cells correctly', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    act(() => { result.current.checkAnswers(); });
    // All locked cells should be correct
    for (let r = 0; r < result.current.lockedCells.length; r++) {
      for (let c = 0; c < result.current.lockedCells[r].length; c++) {
        if (result.current.lockedCells[r][c]) {
          expect(result.current.cellStatus[r][c]).toBe('correct');
        }
      }
    }
  });

  it('revealLetter only works on unlocked cells', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    // Find an unlocked cell
    let unlockedR = -1, unlockedC = -1;
    for (let r = 0; r < result.current.lockedCells.length; r++) {
      for (let c = 0; c < result.current.lockedCells[r].length; c++) {
        if (!result.current.lockedCells[r][c] && mockPuzzle.grid[r][c] !== null) {
          unlockedR = r; unlockedC = c; break;
        }
      }
      if (unlockedR >= 0) break;
    }
    if (unlockedR >= 0) {
      act(() => { result.current.selectCell(unlockedR, unlockedC); });
      act(() => { result.current.revealLetter(); });
      expect(result.current.userGrid[unlockedR][unlockedC]).toBe(mockPuzzle.grid[unlockedR][unlockedC]);
      expect(result.current.hintsUsed).toBe(1);
    }
  });

  it('toggleDirection switches between across and down', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    act(() => { result.current.selectCell(0, 0); });
    const firstDirection = result.current.direction;
    act(() => { result.current.selectCell(0, 0); });
    expect(result.current.direction).not.toBe(firstDirection);
  });
});
