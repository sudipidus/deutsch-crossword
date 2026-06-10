import { describe, it, expect } from 'vitest';
import { generateCrossword } from '../../src/engine/generateCrossword';

const testWords = [
  { word: 'Apfel', level: 'A1', clue: 'apple', context: 'Der ___ ist rot.', article: 'der' },
  { word: 'Auto', level: 'A1', clue: 'car', context: 'Das ___ ist schnell.', article: 'das' },
  { word: 'Haus', level: 'A1', clue: 'house', context: 'Das ___ ist groß.', article: 'das' },
  { word: 'Katze', level: 'A1', clue: 'cat', context: 'Die ___ schläft.', article: 'die' },
  { word: 'Tisch', level: 'A1', clue: 'table', context: 'Der ___ ist groß.', article: 'der' },
  { word: 'Stuhl', level: 'A1', clue: 'chair', context: 'Der ___ ist klein.', article: 'der' },
  { word: 'Schule', level: 'A1', clue: 'school', context: 'Die Kinder gehen zur ___.', article: 'die' },
  { word: 'Milch', level: 'A1', clue: 'milk', context: 'Ich trinke ___.', article: 'die' },
  { word: 'Fisch', level: 'A1', clue: 'fish', context: 'Der ___ schwimmt.', article: 'der' },
  { word: 'Buch', level: 'A1', clue: 'book', context: 'Ich lese ein ___.', article: 'das' },
];

describe('generateCrossword', () => {
  it('returns a puzzle with grid, clues, and placedWords', () => {
    const puzzle = generateCrossword(testWords);
    expect(puzzle).toHaveProperty('grid');
    expect(puzzle).toHaveProperty('clues');
    expect(puzzle).toHaveProperty('placedWords');
    expect(puzzle.grid.length).toBeGreaterThan(0);
    expect(puzzle.clues.length).toBeGreaterThan(0);
  });

  it('places at least 6 words', () => {
    const puzzle = generateCrossword(testWords);
    expect(puzzle.placedWords.length).toBeGreaterThanOrEqual(6);
  });

  it('each clue has number, direction, clue text, context, and level', () => {
    const puzzle = generateCrossword(testWords);
    for (const clue of puzzle.clues) {
      expect(clue).toHaveProperty('number');
      expect(clue).toHaveProperty('direction');
      expect(clue).toHaveProperty('clue');
      expect(clue).toHaveProperty('context');
      expect(clue).toHaveProperty('level');
      expect(clue).toHaveProperty('word');
      expect(clue).toHaveProperty('row');
      expect(clue).toHaveProperty('col');
      expect(['across', 'down']).toContain(clue.direction);
    }
  });

  it('grid cells contain uppercase letters or null', () => {
    const puzzle = generateCrossword(testWords);
    for (const row of puzzle.grid) {
      for (const cell of row) {
        if (cell !== null) {
          expect(cell).toMatch(/^[A-ZÄÖÜ]$/);
        }
      }
    }
  });
});
