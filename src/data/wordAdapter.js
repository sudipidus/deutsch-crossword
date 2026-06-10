import a1Words from './a1.json';
import a2Words from './a2.json';
import b1Words from './b1.json';

const allWords = [...a1Words, ...a2Words, ...b1Words];

export function getAllWords() {
  return allWords;
}

export function getWordsByLevel(level) {
  return allWords.filter(w => w.level === level);
}

export function getRandomWords(count, levels = ['A1', 'A2', 'B1']) {
  const pool = allWords.filter(w => levels.includes(w.level));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
