import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgress } from '../../src/hooks/useProgress';

describe('useProgress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default stats when localStorage is empty', () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.stats.totalCompleted).toBe(0);
    expect(result.current.completed).toEqual([]);
  });

  it('markCompleted adds puzzle ID and updates stats', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.markCompleted('puzzle-1', { wordsCount: 8, hintsUsed: 2, timeSeconds: 300 });
    });
    expect(result.current.completed).toContain('puzzle-1');
    expect(result.current.stats.totalCompleted).toBe(1);
    expect(result.current.stats.wordsLearned).toBe(8);
    expect(result.current.stats.hintsUsed).toBe(2);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.markCompleted('puzzle-1', { wordsCount: 8, hintsUsed: 1, timeSeconds: 200 });
    });
    const stored = JSON.parse(localStorage.getItem('deutsch-crossword-progress'));
    expect(stored.completed).toContain('puzzle-1');
  });

  it('does not duplicate completed puzzle IDs', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.markCompleted('puzzle-1', { wordsCount: 8, hintsUsed: 0, timeSeconds: 100 });
    });
    act(() => {
      result.current.markCompleted('puzzle-1', { wordsCount: 8, hintsUsed: 0, timeSeconds: 100 });
    });
    expect(result.current.completed.filter(id => id === 'puzzle-1').length).toBe(1);
  });
});
