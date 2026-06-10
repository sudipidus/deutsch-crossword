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
  it('initializes with empty user input grid', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    expect(result.current.userGrid[0][0]).toBe('');
    expect(result.current.selectedCell).toBe(null);
  });

  it('selectCell sets the selected cell and active clue', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    act(() => { result.current.selectCell(0, 0); });
    expect(result.current.selectedCell).toEqual({ row: 0, col: 0 });
    expect(result.current.activeClue).not.toBe(null);
  });

  it('inputLetter fills a cell and advances', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    act(() => { result.current.selectCell(0, 0); });
    act(() => { result.current.inputLetter('A'); });
    expect(result.current.userGrid[0][0]).toBe('A');
  });

  it('checkAnswers marks correct and wrong cells', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    act(() => { result.current.selectCell(0, 0); });
    act(() => { result.current.inputLetter('A'); });
    act(() => { result.current.inputLetter('P'); });
    act(() => { result.current.inputLetter('F'); });
    act(() => { result.current.inputLetter('E'); });
    act(() => { result.current.inputLetter('L'); });
    act(() => { result.current.checkAnswers(); });
    expect(result.current.cellStatus[0][0]).toBe('correct');
    expect(result.current.cellStatus[0][4]).toBe('correct');
  });

  it('revealLetter fills current cell with correct letter', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    act(() => { result.current.selectCell(0, 0); });
    act(() => { result.current.revealLetter(); });
    expect(result.current.userGrid[0][0]).toBe('A');
    expect(result.current.hintsUsed).toBe(1);
  });

  it('limits hints to 3', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    act(() => { result.current.selectCell(0, 0); });
    act(() => { result.current.revealLetter(); });
    act(() => { result.current.selectCell(0, 1); });
    act(() => { result.current.revealLetter(); });
    act(() => { result.current.selectCell(0, 2); });
    act(() => { result.current.revealLetter(); });
    act(() => { result.current.selectCell(0, 3); });
    act(() => { result.current.revealLetter(); });
    expect(result.current.hintsUsed).toBe(3);
    expect(result.current.userGrid[0][3]).toBe('');
  });

  it('toggleDirection switches between across and down', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    act(() => { result.current.selectCell(0, 0); });
    const firstDirection = result.current.direction;
    act(() => { result.current.selectCell(0, 0); });
    expect(result.current.direction).not.toBe(firstDirection);
  });
});
