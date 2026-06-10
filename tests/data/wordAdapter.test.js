import { describe, it, expect } from 'vitest';
import { getAllWords, getWordsByLevel } from '../../src/data/wordAdapter';

describe('wordAdapter', () => {
  it('getAllWords returns words from all levels', () => {
    const words = getAllWords();
    expect(words.length).toBeGreaterThan(50);
    const levels = [...new Set(words.map(w => w.level))];
    expect(levels).toContain('A1');
    expect(levels).toContain('A2');
    expect(levels).toContain('B1');
  });

  it('getWordsByLevel filters correctly', () => {
    const a1 = getWordsByLevel('A1');
    expect(a1.length).toBeGreaterThan(0);
    expect(a1.every(w => w.level === 'A1')).toBe(true);
  });

  it('each word has required fields', () => {
    const words = getAllWords();
    for (const w of words) {
      expect(w).toHaveProperty('word');
      expect(w).toHaveProperty('level');
      expect(w).toHaveProperty('clue');
      expect(w).toHaveProperty('context');
      expect(typeof w.word).toBe('string');
      expect(w.word.length).toBeGreaterThan(0);
    }
  });

  it('article is optional', () => {
    const words = getAllWords();
    const withArticle = words.filter(w => w.article);
    expect(withArticle.length).toBeGreaterThan(0);
  });
});
