import { describe, it, expect } from 'vitest';
import { createGrid, canPlaceWord, placeWord, getWordCells } from '../../src/engine/gridUtils';

describe('createGrid', () => {
  it('creates a grid of the specified size filled with null', () => {
    const grid = createGrid(5, 5);
    expect(grid.length).toBe(5);
    expect(grid[0].length).toBe(5);
    expect(grid[2][3]).toBe(null);
  });
});

describe('canPlaceWord', () => {
  it('returns true for empty grid placement', () => {
    const grid = createGrid(10, 10);
    expect(canPlaceWord(grid, 'APFEL', 0, 0, 'across')).toBe(true);
  });

  it('returns false when word goes out of bounds (across)', () => {
    const grid = createGrid(10, 10);
    expect(canPlaceWord(grid, 'APFEL', 0, 8, 'across')).toBe(false);
  });

  it('returns false when word goes out of bounds (down)', () => {
    const grid = createGrid(10, 10);
    expect(canPlaceWord(grid, 'APFEL', 8, 0, 'down')).toBe(false);
  });

  it('returns true when intersecting letter matches', () => {
    const grid = createGrid(10, 10);
    placeWord(grid, 'APFEL', 0, 0, 'across');
    expect(canPlaceWord(grid, 'AUTO', 0, 0, 'down')).toBe(true);
  });

  it('returns false when intersecting letter conflicts', () => {
    const grid = createGrid(10, 10);
    placeWord(grid, 'APFEL', 0, 0, 'across');
    expect(canPlaceWord(grid, 'BUCH', 0, 0, 'down')).toBe(false);
  });
});

describe('placeWord', () => {
  it('places a word across on the grid', () => {
    const grid = createGrid(10, 10);
    placeWord(grid, 'APFEL', 0, 0, 'across');
    expect(grid[0][0]).toBe('A');
    expect(grid[0][1]).toBe('P');
    expect(grid[0][4]).toBe('L');
  });

  it('places a word down on the grid', () => {
    const grid = createGrid(10, 10);
    placeWord(grid, 'HAUS', 0, 0, 'down');
    expect(grid[0][0]).toBe('H');
    expect(grid[1][0]).toBe('A');
    expect(grid[3][0]).toBe('S');
  });
});

describe('getWordCells', () => {
  it('returns cell coordinates for across word', () => {
    const cells = getWordCells('APFEL', 2, 3, 'across');
    expect(cells).toEqual([
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 2, col: 5 },
      { row: 2, col: 6 },
      { row: 2, col: 7 },
    ]);
  });

  it('returns cell coordinates for down word', () => {
    const cells = getWordCells('HAUS', 1, 0, 'down');
    expect(cells).toEqual([
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 3, col: 0 },
      { row: 4, col: 0 },
    ]);
  });
});
