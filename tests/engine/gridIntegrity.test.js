import { describe, it, expect } from 'vitest';
import { generateCrossword } from '../../src/engine/generateCrossword';
import a1Words from '../../src/data/a1.json';

const words = [
  { word: 'Kuh', level: 'A1', clue: 'cow', context: 'Die ___ gibt Milch.' },
  { word: 'Hund', level: 'A1', clue: 'dog', context: 'Der ___ bellt.' },
  { word: 'Katze', level: 'A1', clue: 'cat', context: 'Die ___ schläft.' },
  { word: 'Haus', level: 'A1', clue: 'house', context: 'Das ___ ist groß.' },
  { word: 'Apfel', level: 'A1', clue: 'apple', context: 'Der ___ ist rot.' },
  { word: 'Auto', level: 'A1', clue: 'car', context: 'Das ___ ist schnell.' },
  { word: 'Tisch', level: 'A1', clue: 'table', context: 'Der ___ ist groß.' },
  { word: 'Stuhl', level: 'A1', clue: 'chair', context: 'Der ___ ist klein.' },
  { word: 'Milch', level: 'A1', clue: 'milk', context: 'Ich trinke ___.' },
  { word: 'Fisch', level: 'A1', clue: 'fish', context: 'Der ___ schwimmt.' },
  { word: 'Buch', level: 'A1', clue: 'book', context: 'Ich lese ein ___.' },
  { word: 'Schule', level: 'A1', clue: 'school', context: 'Kinder gehen zur ___.' },
];

describe('grid integrity', () => {
  it('every clue word matches the grid letters at its position', () => {
    for (let run = 0; run < 10; run++) {
      const result = generateCrossword(words);
      for (const c of result.clues) {
        let gridWord = '';
        for (let j = 0; j < c.word.length; j++) {
          const r = c.direction === 'across' ? c.row : c.row + j;
          const col = c.direction === 'across' ? c.col + j : c.col;
          gridWord += result.grid[r]?.[col] ?? '?';
        }
        expect(gridWord).toBe(c.word);
      }
    }
  });

  it('places at least 4 words', () => {
    for (let run = 0; run < 10; run++) {
      const result = generateCrossword(words);
      expect(result.clues.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('every clue word matches grid letters with real A1 data', () => {
    for (let run = 0; run < 20; run++) {
      const result = generateCrossword(a1Words);
      for (const c of result.clues) {
        let gridWord = '';
        for (let j = 0; j < c.word.length; j++) {
          const r = c.direction === 'across' ? c.row : c.row + j;
          const col = c.direction === 'across' ? c.col + j : c.col;
          gridWord += result.grid[r]?.[col] ?? '?';
        }
        if (gridWord !== c.word) {
          console.log(`Run ${run}: ${c.number}${c.direction[0].toUpperCase()} expected "${c.word}" got "${gridWord}" at (${c.row},${c.col})`);
        }
        expect(gridWord).toBe(c.word);
      }
    }
  });
});
