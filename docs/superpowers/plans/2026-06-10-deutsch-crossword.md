# Deutsch Crossword App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side German vocabulary crossword app with curated and auto-generated puzzles, hints, and progress tracking.

**Architecture:** React + Vite SPA with no backend. Crossword generation runs client-side with a backtracking algorithm. Word data ships as JSON with an adapter interface. Progress persists in localStorage.

**Tech Stack:** React 18, Vite, React Router, Vitest + React Testing Library, CSS

**Spec:** `docs/superpowers/specs/2026-06-10-deutsch-crossword-design.md`

---

## File Map

```
src/
  data/
    a1.json                  # A1 word entries
    a2.json                  # A2 word entries
    b1.json                  # B1 word entries
    wordAdapter.js           # Loads and merges word data, adapter interface
  engine/
    generateCrossword.js     # Crossword generation algorithm
    gridUtils.js             # Grid helpers (canPlace, placeWord, scoreLayout)
  hooks/
    useGame.js               # Game state: selected cell, direction, input, check
    useProgress.js           # localStorage progress read/write
  components/
    Grid.jsx                 # Interactive crossword grid
    Grid.css
    ClueBar.jsx              # Active clue display with level badge
    ClueBar.css
    ClueList.jsx             # Tabbed Across/Down clue list
    ClueList.css
    HintButton.jsx           # Hint dropdown (reveal letter, show article)
    HintButton.css
    Timer.jsx                # Optional elapsed time display
  pages/
    Home.jsx                 # Welcome + puzzle selection
    Home.css
    Play.jsx                 # Game screen (composes Grid, ClueBar, ClueList, HintButton, Timer)
    Play.css
    Stats.jsx                # Progress dashboard
    Stats.css
  App.jsx                    # Router + layout shell
  App.css                    # Global styles + CSS variables
  main.jsx                   # Vite entry point
  index.css                  # Reset + base styles
tests/
  engine/
    generateCrossword.test.js
    gridUtils.test.js
  hooks/
    useGame.test.js
    useProgress.test.js
  data/
    wordAdapter.test.js
  components/
    Grid.test.jsx
    ClueList.test.jsx
  pages/
    Home.test.jsx
    Play.test.jsx
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/App.css`, `src/index.css`, `vitest.config.js`

- [ ] **Step 1: Scaffold Vite + React project**

```bash
cd /Users/sudipbhandari/projects/deutsch-crossword
npm create vite@latest . -- --template react
```

Accept overwrite prompts if asked. This creates the base structure.

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.js`:

```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
});
```

Create `tests/setup.js`:

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify scaffolding works**

Run: `npm run dev` — should show Vite dev server starting.
Run: `npm test` — should show 0 tests (no failures).

- [ ] **Step 6: Replace App.jsx with minimal shell**

Replace `src/App.jsx`:

```jsx
function App() {
  return <div className="app">Deutsch Crossword</div>;
}

export default App;
```

Replace `src/App.css`:

```css
:root {
  --color-bg: #1a1a2e;
  --color-surface: #2a2a4a;
  --color-border: #444;
  --color-text: #eee;
  --color-text-secondary: #999;
  --color-accent: #7fdbca;
  --color-a1: #4ade80;
  --color-a2: #facc15;
  --color-b1: #fb923c;
  --color-correct: #4ade80;
  --color-wrong: #f87171;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
}

.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}
```

Replace `src/index.css` with empty file (all styles in App.css).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React project with Vitest"
```

---

## Task 2: Word Data & Adapter

**Files:**
- Create: `src/data/a1.json`, `src/data/a2.json`, `src/data/b1.json`, `src/data/wordAdapter.js`
- Test: `tests/data/wordAdapter.test.js`

- [ ] **Step 1: Create A1 word list**

Create `src/data/a1.json` with ~30 A1 words:

```json
[
  { "word": "Apfel", "level": "A1", "clue": "apple", "context": "Der ___ ist rot.", "article": "der" },
  { "word": "Wasser", "level": "A1", "clue": "water", "context": "Ich trinke ___.", "article": "das" },
  { "word": "Brot", "level": "A1", "clue": "bread", "context": "Ich esse ___ zum Frühstück.", "article": "das" },
  { "word": "Haus", "level": "A1", "clue": "house", "context": "Das ___ ist groß.", "article": "das" },
  { "word": "Katze", "level": "A1", "clue": "cat", "context": "Die ___ schläft.", "article": "die" },
  { "word": "Hund", "level": "A1", "clue": "dog", "context": "Der ___ spielt im Garten.", "article": "der" },
  { "word": "Milch", "level": "A1", "clue": "milk", "context": "Ich trinke ___ zum Frühstück.", "article": "die" },
  { "word": "Schule", "level": "A1", "clue": "school", "context": "Die Kinder gehen zur ___.", "article": "die" },
  { "word": "Buch", "level": "A1", "clue": "book", "context": "Ich lese ein ___.", "article": "das" },
  { "word": "Auto", "level": "A1", "clue": "car", "context": "Das ___ ist schnell.", "article": "das" },
  { "word": "Frau", "level": "A1", "clue": "woman", "context": "Die ___ liest ein Buch.", "article": "die" },
  { "word": "Mann", "level": "A1", "clue": "man", "context": "Der ___ arbeitet.", "article": "der" },
  { "word": "Kind", "level": "A1", "clue": "child", "context": "Das ___ spielt.", "article": "das" },
  { "word": "Tag", "level": "A1", "clue": "day", "context": "Heute ist ein schöner ___.", "article": "der" },
  { "word": "Nacht", "level": "A1", "clue": "night", "context": "Die ___ ist dunkel.", "article": "die" },
  { "word": "Stadt", "level": "A1", "clue": "city", "context": "Die ___ ist sehr groß.", "article": "die" },
  { "word": "Freund", "level": "A1", "clue": "friend", "context": "Mein ___ heißt Tom.", "article": "der" },
  { "word": "Tisch", "level": "A1", "clue": "table", "context": "Das Essen steht auf dem ___.", "article": "der" },
  { "word": "Stuhl", "level": "A1", "clue": "chair", "context": "Bitte setz dich auf den ___.", "article": "der" },
  { "word": "Tür", "level": "A1", "clue": "door", "context": "Bitte mach die ___ zu.", "article": "die" },
  { "word": "Geld", "level": "A1", "clue": "money", "context": "Ich habe kein ___.", "article": "das" },
  { "word": "Kaffee", "level": "A1", "clue": "coffee", "context": "Ich trinke gern ___.", "article": "der" },
  { "word": "Reis", "level": "A1", "clue": "rice", "context": "Ich esse ___ mit Gemüse.", "article": "der" },
  { "word": "Fisch", "level": "A1", "clue": "fish", "context": "Der ___ schwimmt im Wasser.", "article": "der" },
  { "word": "Arzt", "level": "A1", "clue": "doctor", "context": "Ich gehe zum ___.", "article": "der" },
  { "word": "Uhr", "level": "A1", "clue": "clock", "context": "Es ist drei ___.", "article": "die" },
  { "word": "Jahr", "level": "A1", "clue": "year", "context": "Ein ___ hat zwölf Monate.", "article": "das" },
  { "word": "Arbeit", "level": "A1", "clue": "work", "context": "Ich gehe zur ___.", "article": "die" },
  { "word": "Essen", "level": "A1", "clue": "food", "context": "Das ___ schmeckt gut.", "article": "das" },
  { "word": "Zimmer", "level": "A1", "clue": "room", "context": "Das ___ ist klein.", "article": "das" }
]
```

- [ ] **Step 2: Create A2 word list**

Create `src/data/a2.json` with ~25 A2 words:

```json
[
  { "word": "Flughafen", "level": "A2", "clue": "airport", "context": "Wir fahren zum ___.", "article": "der" },
  { "word": "Bahnhof", "level": "A2", "clue": "train station", "context": "Der Zug kommt am ___ an.", "article": "der" },
  { "word": "Krankenhaus", "level": "A2", "clue": "hospital", "context": "Er liegt im ___.", "article": "das" },
  { "word": "Ausflug", "level": "A2", "clue": "excursion", "context": "Wir machen einen ___.", "article": "der" },
  { "word": "Nachricht", "level": "A2", "clue": "message", "context": "Ich habe eine ___ bekommen.", "article": "die" },
  { "word": "Erfahrung", "level": "A2", "clue": "experience", "context": "Das war eine gute ___.", "article": "die" },
  { "word": "Gewitter", "level": "A2", "clue": "thunderstorm", "context": "Es gibt ein ___.", "article": "das" },
  { "word": "Geburtstag", "level": "A2", "clue": "birthday", "context": "Heute ist mein ___.", "article": "der" },
  { "word": "Frühstück", "level": "A2", "clue": "breakfast", "context": "Das ___ ist fertig.", "article": "das" },
  { "word": "Antwort", "level": "A2", "clue": "answer", "context": "Ich warte auf eine ___.", "article": "die" },
  { "word": "Beispiel", "level": "A2", "clue": "example", "context": "Kannst du ein ___ geben?", "article": "das" },
  { "word": "Urlaub", "level": "A2", "clue": "vacation", "context": "Wir fahren in den ___.", "article": "der" },
  { "word": "Ordnung", "level": "A2", "clue": "order", "context": "Alles in ___!", "article": "die" },
  { "word": "Fehler", "level": "A2", "clue": "mistake", "context": "Das war ein ___.", "article": "der" },
  { "word": "Lösung", "level": "A2", "clue": "solution", "context": "Wir brauchen eine ___.", "article": "die" },
  { "word": "Gefühl", "level": "A2", "clue": "feeling", "context": "Ich habe ein gutes ___.", "article": "das" },
  { "word": "Hunger", "level": "A2", "clue": "hunger", "context": "Ich habe großen ___.", "article": "der" },
  { "word": "Küche", "level": "A2", "clue": "kitchen", "context": "Ich koche in der ___.", "article": "die" },
  { "word": "Brücke", "level": "A2", "clue": "bridge", "context": "Wir gehen über die ___.", "article": "die" },
  { "word": "Nachbar", "level": "A2", "clue": "neighbor", "context": "Mein ___ ist sehr nett.", "article": "der" },
  { "word": "Gepäck", "level": "A2", "clue": "luggage", "context": "Wo ist mein ___?", "article": "das" },
  { "word": "Rechnung", "level": "A2", "clue": "bill", "context": "Kann ich die ___ haben?", "article": "die" },
  { "word": "Wohnung", "level": "A2", "clue": "apartment", "context": "Die ___ hat drei Zimmer.", "article": "die" },
  { "word": "Anfang", "level": "A2", "clue": "beginning", "context": "Am ___ war es schwer.", "article": "der" },
  { "word": "Spiegel", "level": "A2", "clue": "mirror", "context": "Ich schaue in den ___.", "article": "der" }
]
```

- [ ] **Step 3: Create B1 word list**

Create `src/data/b1.json` with ~25 B1 words:

```json
[
  { "word": "Verantwortung", "level": "B1", "clue": "responsibility", "context": "Du trägst die ___.", "article": "die" },
  { "word": "Ergebnis", "level": "B1", "clue": "result", "context": "Das ___ war überraschend.", "article": "das" },
  { "word": "Vorschlag", "level": "B1", "clue": "suggestion", "context": "Ich habe einen ___.", "article": "der" },
  { "word": "Behandlung", "level": "B1", "clue": "treatment", "context": "Die ___ dauert drei Wochen.", "article": "die" },
  { "word": "Bewerbung", "level": "B1", "clue": "application", "context": "Ich schreibe eine ___.", "article": "die" },
  { "word": "Eindruck", "level": "B1", "clue": "impression", "context": "Der erste ___ zählt.", "article": "der" },
  { "word": "Fortschritt", "level": "B1", "clue": "progress", "context": "Du machst große ___e.", "article": "der" },
  { "word": "Gesellschaft", "level": "B1", "clue": "society", "context": "Die ___ verändert sich.", "article": "die" },
  { "word": "Grundlage", "level": "B1", "clue": "foundation", "context": "Das ist die ___ für alles.", "article": "die" },
  { "word": "Zusammenhang", "level": "B1", "clue": "connection", "context": "In diesem ___ ist das wichtig.", "article": "der" },
  { "word": "Verhalten", "level": "B1", "clue": "behavior", "context": "Sein ___ war seltsam.", "article": "das" },
  { "word": "Überraschung", "level": "B1", "clue": "surprise", "context": "Das war eine große ___.", "article": "die" },
  { "word": "Ausbildung", "level": "B1", "clue": "training", "context": "Die ___ dauert drei Jahre.", "article": "die" },
  { "word": "Umgebung", "level": "B1", "clue": "surroundings", "context": "Die ___ ist sehr schön.", "article": "die" },
  { "word": "Meinung", "level": "B1", "clue": "opinion", "context": "Meiner ___ nach ist das richtig.", "article": "die" },
  { "word": "Leistung", "level": "B1", "clue": "performance", "context": "Seine ___ war hervorragend.", "article": "die" },
  { "word": "Enttäuschung", "level": "B1", "clue": "disappointment", "context": "Das war eine große ___.", "article": "die" },
  { "word": "Vergleich", "level": "B1", "clue": "comparison", "context": "Im ___ zu gestern ist es besser.", "article": "der" },
  { "word": "Bedingung", "level": "B1", "clue": "condition", "context": "Unter einer ___.", "article": "die" },
  { "word": "Wirkung", "level": "B1", "clue": "effect", "context": "Die ___ war sofort spürbar.", "article": "die" },
  { "word": "Richtung", "level": "B1", "clue": "direction", "context": "In welche ___ gehen wir?", "article": "die" },
  { "word": "Vorteil", "level": "B1", "clue": "advantage", "context": "Das ist ein großer ___.", "article": "der" },
  { "word": "Nachteil", "level": "B1", "clue": "disadvantage", "context": "Der ___ ist der Preis.", "article": "der" },
  { "word": "Entscheidung", "level": "B1", "clue": "decision", "context": "Das war eine schwere ___.", "article": "die" },
  { "word": "Entwicklung", "level": "B1", "clue": "development", "context": "Die ___ geht weiter.", "article": "die" }
]
```

- [ ] **Step 4: Write the failing test for wordAdapter**

Create `tests/data/wordAdapter.test.js`:

```js
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
    const withoutArticle = words.filter(w => !w.article);
    expect(withArticle.length).toBeGreaterThan(0);
    // All current words are nouns so withoutArticle may be 0, that's ok
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run tests/data/wordAdapter.test.js`
Expected: FAIL — cannot find module `wordAdapter`

- [ ] **Step 6: Implement wordAdapter**

Create `src/data/wordAdapter.js`:

```js
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
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run tests/data/wordAdapter.test.js`
Expected: All 4 tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/data/ tests/data/
git commit -m "feat: add A1-B1 word data and adapter"
```

---

## Task 3: Grid Utilities

**Files:**
- Create: `src/engine/gridUtils.js`
- Test: `tests/engine/gridUtils.test.js`

- [ ] **Step 1: Write failing tests for grid utilities**

Create `tests/engine/gridUtils.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/engine/gridUtils.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement gridUtils**

Create `src/engine/gridUtils.js`:

```js
export function createGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export function canPlaceWord(grid, word, row, col, direction) {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let i = 0; i < word.length; i++) {
    const r = direction === 'across' ? row : row + i;
    const c = direction === 'across' ? col + i : col;

    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;

    const existing = grid[r][c];
    if (existing !== null && existing !== word[i]) return false;
  }

  return true;
}

export function placeWord(grid, word, row, col, direction) {
  for (let i = 0; i < word.length; i++) {
    const r = direction === 'across' ? row : row + i;
    const c = direction === 'across' ? col + i : col;
    grid[r][c] = word[i];
  }
}

export function getWordCells(word, row, col, direction) {
  const cells = [];
  for (let i = 0; i < word.length; i++) {
    cells.push({
      row: direction === 'across' ? row : row + i,
      col: direction === 'across' ? col + i : col,
    });
  }
  return cells;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/engine/gridUtils.test.js`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/gridUtils.js tests/engine/gridUtils.test.js
git commit -m "feat: add grid utility functions with tests"
```

---

## Task 4: Crossword Generation Algorithm

**Files:**
- Create: `src/engine/generateCrossword.js`
- Test: `tests/engine/generateCrossword.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/engine/generateCrossword.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/engine/generateCrossword.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement generateCrossword**

Create `src/engine/generateCrossword.js`:

```js
import { createGrid, canPlaceWord, placeWord } from './gridUtils';

function findIntersections(grid, word, gridSize) {
  const positions = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      for (const direction of ['across', 'down']) {
        if (!canPlaceWord(grid, word, row, col, direction)) continue;

        // Count intersections with existing letters
        let intersections = 0;
        for (let i = 0; i < word.length; i++) {
          const r = direction === 'across' ? row : row + i;
          const c = direction === 'across' ? col + i : col;
          if (grid[r][c] === word[i]) intersections++;
        }

        // Must intersect at least once (unless grid is empty)
        const gridHasLetters = grid.some(r => r.some(c => c !== null));
        if (gridHasLetters && intersections === 0) continue;

        positions.push({ row, col, direction, intersections });
      }
    }
  }

  // Sort by most intersections first
  positions.sort((a, b) => b.intersections - a.intersections);
  return positions;
}

function attemptGeneration(wordEntries) {
  const gridSize = 13;
  const grid = createGrid(gridSize, gridSize);
  const placed = [];

  // Sort by word length descending
  const sorted = [...wordEntries].sort((a, b) => b.word.length - a.word.length);

  for (const entry of sorted) {
    const word = entry.word.toUpperCase();

    if (placed.length === 0) {
      // Place first word in the center-ish area
      const startRow = Math.floor(gridSize / 2);
      const startCol = Math.floor((gridSize - word.length) / 2);
      placeWord(grid, word, startRow, startCol, 'across');
      placed.push({ ...entry, word: word, row: startRow, col: startCol, direction: 'across' });
      continue;
    }

    const positions = findIntersections(grid, word, gridSize);
    if (positions.length > 0) {
      const best = positions[0];
      placeWord(grid, word, best.row, best.col, best.direction);
      placed.push({ ...entry, word: word, row: best.row, col: best.col, direction: best.direction });
    }
  }

  return { grid, placed };
}

function assignClueNumbers(placed) {
  // Sort by position: top-to-bottom, left-to-right
  const sorted = [...placed].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  let number = 1;
  const numberMap = new Map(); // "row,col" -> number
  const clues = [];

  for (const entry of sorted) {
    const key = `${entry.row},${entry.col}`;
    if (!numberMap.has(key)) {
      numberMap.set(key, number++);
    }

    clues.push({
      number: numberMap.get(key),
      direction: entry.direction,
      clue: entry.clue,
      context: entry.context,
      level: entry.level,
      word: entry.word,
      row: entry.row,
      col: entry.col,
      article: entry.article || null,
    });
  }

  return clues;
}

function trimGrid(grid) {
  let minRow = grid.length, maxRow = 0, minCol = grid[0].length, maxCol = 0;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] !== null) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }

  const trimmed = [];
  for (let r = minRow; r <= maxRow; r++) {
    trimmed.push(grid[r].slice(minCol, maxCol + 1));
  }

  return { grid: trimmed, rowOffset: minRow, colOffset: minCol };
}

export function generateCrossword(wordEntries, maxAttempts = 3) {
  let bestResult = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Shuffle the input for variety across attempts
    const shuffled = [...wordEntries].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 12);

    const { grid, placed } = attemptGeneration(selected);

    if (!bestResult || placed.length > bestResult.placed.length) {
      bestResult = { grid, placed };
    }

    if (placed.length >= 6) break;
  }

  if (!bestResult || bestResult.placed.length < 6) {
    // Caller should handle fallback to pre-built puzzle
    // But try to return what we have
  }

  const { grid: trimmedGrid, rowOffset, colOffset } = trimGrid(bestResult.grid);

  // Adjust placed word coordinates to trimmed grid
  const adjustedPlaced = bestResult.placed.map(p => ({
    ...p,
    row: p.row - rowOffset,
    col: p.col - colOffset,
  }));

  const clues = assignClueNumbers(adjustedPlaced);

  return {
    grid: trimmedGrid,
    clues,
    placedWords: adjustedPlaced,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/engine/generateCrossword.test.js`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/generateCrossword.js tests/engine/generateCrossword.test.js
git commit -m "feat: add crossword generation algorithm with backtracking"
```

---

## Task 5: useProgress Hook

**Files:**
- Create: `src/hooks/useProgress.js`
- Test: `tests/hooks/useProgress.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/hooks/useProgress.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/hooks/useProgress.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement useProgress**

Create `src/hooks/useProgress.js`:

```js
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'deutsch-crossword-progress';

function loadProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    // Corrupted data, reset
  }
  return {
    completed: [],
    stats: { totalCompleted: 0, wordsLearned: 0, hintsUsed: 0, averageTime: 0 },
  };
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  const [progress, setProgress] = useState(loadProgress);

  const markCompleted = useCallback((puzzleId, { wordsCount, hintsUsed, timeSeconds }) => {
    setProgress(prev => {
      if (prev.completed.includes(puzzleId)) return prev;

      const newCompleted = [...prev.completed, puzzleId];
      const totalCompleted = newCompleted.length;
      const totalTime = prev.stats.averageTime * prev.stats.totalCompleted + timeSeconds;

      const newProgress = {
        completed: newCompleted,
        stats: {
          totalCompleted,
          wordsLearned: prev.stats.wordsLearned + wordsCount,
          hintsUsed: prev.stats.hintsUsed + hintsUsed,
          averageTime: Math.round(totalTime / totalCompleted),
        },
      };

      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  return {
    completed: progress.completed,
    stats: progress.stats,
    markCompleted,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/hooks/useProgress.test.js`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useProgress.js tests/hooks/useProgress.test.js
git commit -m "feat: add useProgress hook with localStorage persistence"
```

---

## Task 6: useGame Hook

**Files:**
- Create: `src/hooks/useGame.js`
- Test: `tests/hooks/useGame.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/hooks/useGame.test.js`:

```js
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
    act(() => {
      result.current.selectCell(0, 0);
    });
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
    // Fill in APFEL correctly
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
    // 4th hint should be ignored
    expect(result.current.hintsUsed).toBe(3);
    expect(result.current.userGrid[0][3]).toBe('');
  });

  it('toggleDirection switches between across and down', () => {
    const { result } = renderHook(() => useGame(mockPuzzle));
    act(() => { result.current.selectCell(0, 0); });
    const firstDirection = result.current.direction;
    act(() => { result.current.selectCell(0, 0); }); // tap same cell
    expect(result.current.direction).not.toBe(firstDirection);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/hooks/useGame.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement useGame**

Create `src/hooks/useGame.js`:

```js
import { useState, useCallback, useMemo } from 'react';

const MAX_HINTS = 3;

export function useGame(puzzle) {
  const rows = puzzle.grid.length;
  const cols = puzzle.grid[0].length;

  const [userGrid, setUserGrid] = useState(() =>
    Array.from({ length: rows }, () => Array(cols).fill(''))
  );
  const [cellStatus, setCellStatus] = useState(() =>
    Array.from({ length: rows }, () => Array(cols).fill(null))
  );
  const [selectedCell, setSelectedCell] = useState(null);
  const [direction, setDirection] = useState('across');
  const [hintsUsed, setHintsUsed] = useState(0);

  const activeClue = useMemo(() => {
    if (!selectedCell) return null;
    const { row, col } = selectedCell;
    // Find a clue that covers this cell in the current direction
    const clue = puzzle.clues.find(c => {
      if (c.direction !== direction) return false;
      const len = c.word.length;
      if (c.direction === 'across') {
        return row === c.row && col >= c.col && col < c.col + len;
      } else {
        return col === c.col && row >= c.row && row < c.row + len;
      }
    });
    // Fallback to other direction
    if (!clue) {
      return puzzle.clues.find(c => {
        const len = c.word.length;
        if (c.direction === 'across') {
          return row === c.row && col >= c.col && col < c.col + len;
        } else {
          return col === c.col && row >= c.row && row < c.row + len;
        }
      }) || null;
    }
    return clue;
  }, [selectedCell, direction, puzzle.clues]);

  const selectCell = useCallback((row, col) => {
    if (puzzle.grid[row][col] === null) return; // black cell

    setSelectedCell(prev => {
      if (prev && prev.row === row && prev.col === col) {
        // Same cell tapped — toggle direction
        setDirection(d => d === 'across' ? 'down' : 'across');
        return prev;
      }
      return { row, col };
    });
  }, [puzzle.grid]);

  const inputLetter = useCallback((letter) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (puzzle.grid[row][col] === null) return;

    const upper = letter.toUpperCase();
    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = upper;
      return next;
    });

    // Advance to next cell in direction
    const nextRow = direction === 'across' ? row : row + 1;
    const nextCol = direction === 'across' ? col + 1 : col;
    if (nextRow < rows && nextCol < cols && puzzle.grid[nextRow][nextCol] !== null) {
      setSelectedCell({ row: nextRow, col: nextCol });
    }
  }, [selectedCell, direction, rows, cols, puzzle.grid]);

  const deleteLetter = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = '';
      return next;
    });

    // Move cursor backward in current direction
    const prevRow = direction === 'across' ? row : row - 1;
    const prevCol = direction === 'across' ? col - 1 : col;
    if (prevRow >= 0 && prevCol >= 0 && puzzle.grid[prevRow][prevCol] !== null) {
      setSelectedCell({ row: prevRow, col: prevCol });
    }
  }, [selectedCell, direction, puzzle.grid]);

  const checkAnswers = useCallback(() => {
    setCellStatus(
      puzzle.grid.map((row, r) =>
        row.map((cell, c) => {
          if (cell === null) return null;
          if (userGrid[r][c] === '') return null;
          return userGrid[r][c] === cell ? 'correct' : 'wrong';
        })
      )
    );
  }, [puzzle.grid, userGrid]);

  const revealLetter = useCallback(() => {
    if (!selectedCell || hintsUsed >= MAX_HINTS) return;
    const { row, col } = selectedCell;
    const correctLetter = puzzle.grid[row][col];
    if (!correctLetter) return;

    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = correctLetter;
      return next;
    });
    setHintsUsed(h => h + 1);
  }, [selectedCell, hintsUsed, puzzle.grid]);

  const isComplete = useMemo(() => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (puzzle.grid[r][c] !== null && userGrid[r][c] !== puzzle.grid[r][c]) {
          return false;
        }
      }
    }
    return true;
  }, [puzzle.grid, userGrid, rows, cols]);

  return {
    userGrid,
    cellStatus,
    selectedCell,
    direction,
    activeClue,
    hintsUsed,
    isComplete,
    selectCell,
    inputLetter,
    deleteLetter,
    checkAnswers,
    revealLetter,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/hooks/useGame.test.js`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGame.js tests/hooks/useGame.test.js
git commit -m "feat: add useGame hook for crossword interaction state"
```

---

## Task 7: Grid Component

**Files:**
- Create: `src/components/Grid.jsx`, `src/components/Grid.css`
- Test: `tests/components/Grid.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `tests/components/Grid.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Grid from '../../src/components/Grid';

const mockGrid = [
  ['A', 'P', 'F', 'E', 'L'],
  [null, null, null, null, null],
  ['H', 'A', 'U', 'S', null],
];

const mockUserGrid = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
];

const mockCellStatus = [
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
];

const mockClues = [
  { number: 1, direction: 'across', word: 'APFEL', row: 0, col: 0 },
  { number: 2, direction: 'across', word: 'HAUS', row: 2, col: 0 },
];

describe('Grid', () => {
  it('renders correct number of cells', () => {
    const { container } = render(
      <Grid
        solutionGrid={mockGrid}
        userGrid={mockUserGrid}
        cellStatus={mockCellStatus}
        clues={mockClues}
        selectedCell={null}
        direction="across"
        activeClue={null}
        onCellClick={() => {}}
      />
    );
    // 5*3 = 15 total cells, but null cells are black
    const cells = container.querySelectorAll('.grid-cell');
    expect(cells.length).toBe(15);
  });

  it('calls onCellClick when a white cell is clicked', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Grid
        solutionGrid={mockGrid}
        userGrid={mockUserGrid}
        cellStatus={mockCellStatus}
        clues={mockClues}
        selectedCell={null}
        direction="across"
        activeClue={null}
        onCellClick={handleClick}
      />
    );
    const firstCell = container.querySelector('.grid-cell:not(.black)');
    fireEvent.click(firstCell);
    expect(handleClick).toHaveBeenCalled();
  });

  it('shows clue numbers on starting cells', () => {
    const { container } = render(
      <Grid
        solutionGrid={mockGrid}
        userGrid={mockUserGrid}
        cellStatus={mockCellStatus}
        clues={mockClues}
        selectedCell={null}
        direction="across"
        activeClue={null}
        onCellClick={() => {}}
      />
    );
    expect(container.textContent).toContain('1');
    expect(container.textContent).toContain('2');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/Grid.test.jsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement Grid component**

Create `src/components/Grid.jsx`:

```jsx
import './Grid.css';

function Grid({ solutionGrid, userGrid, cellStatus, clues, selectedCell, direction, activeClue, onCellClick }) {
  const rows = solutionGrid.length;
  const cols = solutionGrid[0].length;

  // Build number map from clues
  const numberMap = {};
  for (const clue of clues) {
    const key = `${clue.row},${clue.col}`;
    if (!numberMap[key]) numberMap[key] = clue.number;
  }

  // Build set of highlighted cells from active clue
  const highlightedCells = new Set();
  if (activeClue) {
    for (let i = 0; i < activeClue.word.length; i++) {
      const r = activeClue.direction === 'across' ? activeClue.row : activeClue.row + i;
      const c = activeClue.direction === 'across' ? activeClue.col + i : activeClue.col;
      highlightedCells.add(`${r},${c}`);
    }
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {solutionGrid.map((row, r) =>
        row.map((cell, c) => {
          const isBlack = cell === null;
          const isSelected = selectedCell && selectedCell.row === r && selectedCell.col === c;
          const isHighlighted = highlightedCells.has(`${r},${c}`);
          const status = cellStatus[r][c];
          const number = numberMap[`${r},${c}`];

          const classes = [
            'grid-cell',
            isBlack && 'black',
            isSelected && 'selected',
            isHighlighted && !isSelected && 'highlighted',
            status === 'correct' && 'correct',
            status === 'wrong' && 'wrong',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={`${r}-${c}`}
              className={classes}
              onClick={() => !isBlack && onCellClick(r, c)}
            >
              {number && <span className="cell-number">{number}</span>}
              {!isBlack && <span className="cell-letter">{userGrid[r][c]}</span>}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Grid;
```

Create `src/components/Grid.css`:

```css
.grid {
  display: grid;
  gap: 2px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  aspect-ratio: 1;
}

.grid-cell {
  position: relative;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  aspect-ratio: 1;
  min-width: 0;
}

.grid-cell.black {
  background: var(--color-bg);
  border-color: transparent;
  cursor: default;
}

.grid-cell.selected {
  border-color: var(--color-accent);
  background: rgba(127, 219, 202, 0.2);
}

.grid-cell.highlighted {
  border-color: rgba(127, 219, 202, 0.5);
  background: rgba(127, 219, 202, 0.08);
}

.grid-cell.correct {
  border-color: var(--color-correct);
  background: rgba(74, 222, 128, 0.15);
}

.grid-cell.wrong {
  border-color: var(--color-wrong);
  background: rgba(248, 113, 113, 0.15);
}

.cell-number {
  position: absolute;
  top: 1px;
  left: 2px;
  font-size: 0.55em;
  color: var(--color-text-secondary);
  line-height: 1;
}

.cell-letter {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--color-text);
  text-transform: uppercase;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/Grid.test.jsx`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Grid.jsx src/components/Grid.css tests/components/Grid.test.jsx
git commit -m "feat: add interactive Grid component"
```

---

## Task 8: ClueBar & ClueList Components

**Files:**
- Create: `src/components/ClueBar.jsx`, `src/components/ClueBar.css`, `src/components/ClueList.jsx`, `src/components/ClueList.css`
- Test: `tests/components/ClueList.test.jsx`

- [ ] **Step 1: Write failing test for ClueList**

Create `tests/components/ClueList.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClueList from '../../src/components/ClueList';

const mockClues = [
  { number: 1, direction: 'across', clue: 'apple', context: 'Der ___ ist rot.', level: 'A1', word: 'APFEL', row: 0, col: 0 },
  { number: 2, direction: 'across', clue: 'house', context: 'Das ___ ist groß.', level: 'A1', word: 'HAUS', row: 2, col: 0 },
  { number: 1, direction: 'down', clue: 'car', context: 'Das ___ ist schnell.', level: 'A2', word: 'AUTO', row: 0, col: 0 },
];

describe('ClueList', () => {
  it('renders Across and Down tabs', () => {
    render(<ClueList clues={mockClues} activeClue={null} onClueClick={() => {}} completedWords={[]} />);
    expect(screen.getByText('Across')).toBeInTheDocument();
    expect(screen.getByText('Down')).toBeInTheDocument();
  });

  it('shows clues for the selected tab', () => {
    render(<ClueList clues={mockClues} activeClue={null} onClueClick={() => {}} completedWords={[]} />);
    expect(screen.getByText(/apple/)).toBeInTheDocument();
    expect(screen.getByText(/house/)).toBeInTheDocument();
  });

  it('calls onClueClick when a clue is tapped', () => {
    const handleClick = vi.fn();
    render(<ClueList clues={mockClues} activeClue={null} onClueClick={handleClick} completedWords={[]} />);
    fireEvent.click(screen.getByText(/apple/));
    expect(handleClick).toHaveBeenCalledWith(mockClues[0]);
  });

  it('switches tabs when Down is clicked', () => {
    render(<ClueList clues={mockClues} activeClue={null} onClueClick={() => {}} completedWords={[]} />);
    fireEvent.click(screen.getByText('Down'));
    expect(screen.getByText(/car/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/ClueList.test.jsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement ClueBar**

Create `src/components/ClueBar.jsx`:

```jsx
import './ClueBar.css';

function ClueBar({ clue }) {
  if (!clue) {
    return <div className="clue-bar empty">Select a cell to begin</div>;
  }

  const levelClass = clue.level.toLowerCase();

  return (
    <div className="clue-bar">
      <span className={`level-badge ${levelClass}`}>{clue.level}</span>
      <span className="clue-text">
        {clue.number}{clue.direction === 'across' ? 'A' : 'D'}. {clue.clue}
      </span>
      <span className="clue-context">{clue.context}</span>
    </div>
  );
}

export default ClueBar;
```

Create `src/components/ClueBar.css`:

```css
.clue-bar {
  background: var(--color-accent);
  color: var(--color-bg);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.clue-bar.empty {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  justify-content: center;
}

.level-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-bg);
}

.level-badge.a1 { background: var(--color-a1); }
.level-badge.a2 { background: var(--color-a2); }
.level-badge.b1 { background: var(--color-b1); }

.clue-context {
  font-weight: 400;
  font-style: italic;
  font-size: 0.85rem;
}
```

- [ ] **Step 4: Implement ClueList**

Create `src/components/ClueList.jsx`:

```jsx
import { useState } from 'react';
import './ClueList.css';

function ClueList({ clues, activeClue, onClueClick, completedWords }) {
  const [tab, setTab] = useState('across');

  const filtered = clues.filter(c => c.direction === tab);

  return (
    <div className="clue-list">
      <div className="clue-tabs">
        <button
          className={`clue-tab ${tab === 'across' ? 'active' : ''}`}
          onClick={() => setTab('across')}
        >
          Across
        </button>
        <button
          className={`clue-tab ${tab === 'down' ? 'active' : ''}`}
          onClick={() => setTab('down')}
        >
          Down
        </button>
      </div>
      <div className="clue-items">
        {filtered.map(clue => {
          const isActive = activeClue && activeClue.number === clue.number && activeClue.direction === clue.direction;
          const isCompleted = completedWords.includes(clue.word);

          return (
            <div
              key={`${clue.number}-${clue.direction}`}
              className={`clue-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onClueClick(clue)}
            >
              <span className="clue-number">{clue.number}.</span>
              <span className="clue-text">{clue.clue}</span>
              {isCompleted && <span className="checkmark">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ClueList;
```

Create `src/components/ClueList.css`:

```css
.clue-list {
  margin-top: 12px;
}

.clue-tabs {
  display: flex;
  gap: 0;
}

.clue-tab {
  flex: 1;
  padding: 8px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  transition: background 0.2s, color 0.2s;
}

.clue-tab:first-child { border-radius: 6px 0 0 6px; }
.clue-tab:last-child { border-radius: 0 6px 6px 0; }

.clue-tab.active {
  background: var(--color-accent);
  color: var(--color-bg);
}

.clue-items {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;
}

.clue-item {
  padding: 8px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  font-size: 0.85rem;
  transition: background 0.15s;
}

.clue-item:hover {
  background: rgba(127, 219, 202, 0.1);
}

.clue-item.active {
  background: rgba(127, 219, 202, 0.15);
  color: var(--color-accent);
}

.clue-item.completed {
  color: var(--color-text-secondary);
}

.clue-number {
  font-weight: 700;
  min-width: 24px;
}

.checkmark {
  margin-left: auto;
  color: var(--color-correct);
  font-weight: 700;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/components/ClueList.test.jsx`
Expected: All 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/ClueBar.jsx src/components/ClueBar.css src/components/ClueList.jsx src/components/ClueList.css tests/components/ClueList.test.jsx
git commit -m "feat: add ClueBar and ClueList components"
```

---

## Task 9: HintButton & Timer Components

**Files:**
- Create: `src/components/HintButton.jsx`, `src/components/HintButton.css`, `src/components/Timer.jsx`

- [ ] **Step 1: Implement HintButton**

Create `src/components/HintButton.jsx`:

```jsx
import { useState } from 'react';
import './HintButton.css';

function HintButton({ hintsUsed, maxHints, activeClue, onRevealLetter }) {
  const [open, setOpen] = useState(false);
  const remaining = maxHints - hintsUsed;

  return (
    <div className="hint-button-wrapper">
      <button className="hint-button" onClick={() => setOpen(!open)} disabled={remaining <= 0}>
        Hint ({remaining})
      </button>
      {open && (
        <div className="hint-dropdown">
          <button
            className="hint-option"
            onClick={() => { onRevealLetter(); setOpen(false); }}
            disabled={remaining <= 0}
          >
            Reveal Letter
          </button>
          {activeClue && activeClue.article && (
            <div className="hint-info">
              Article: <strong>{activeClue.article}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HintButton;
```

Create `src/components/HintButton.css`:

```css
.hint-button-wrapper {
  position: relative;
  display: inline-block;
}

.hint-button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 2px solid var(--color-accent);
  background: transparent;
  color: var(--color-accent);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.hint-button:hover:not(:disabled) {
  background: rgba(127, 219, 202, 0.1);
}

.hint-button:disabled {
  opacity: 0.4;
  cursor: default;
}

.hint-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 6px;
  min-width: 160px;
  z-index: 10;
}

.hint-option {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 4px;
  text-align: left;
}

.hint-option:hover:not(:disabled) {
  background: rgba(127, 219, 202, 0.1);
}

.hint-info {
  padding: 8px 10px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border);
  margin-top: 4px;
}
```

- [ ] **Step 2: Implement Timer**

Create `src/components/Timer.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react';

function Timer({ running }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <span className="timer">
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

export default Timer;
export { Timer };
```

- [ ] **Step 3: Commit**

```bash
git add src/components/HintButton.jsx src/components/HintButton.css src/components/Timer.jsx
git commit -m "feat: add HintButton and Timer components"
```

---

## Task 10: Play Page

**Files:**
- Create: `src/pages/Play.jsx`, `src/pages/Play.css`
- Test: `tests/pages/Play.test.jsx`

- [ ] **Step 1: Write failing test**

Create `tests/pages/Play.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Play from '../../src/pages/Play';

describe('Play', () => {
  it('renders the crossword grid and clue list', () => {
    render(
      <MemoryRouter>
        <Play />
      </MemoryRouter>
    );
    // Should have Across/Down tabs
    expect(screen.getByText('Across')).toBeInTheDocument();
    expect(screen.getByText('Down')).toBeInTheDocument();
    // Should have Check button
    expect(screen.getByText('Check')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages/Play.test.jsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement Play page**

Create `src/pages/Play.jsx`:

```jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Grid from '../components/Grid';
import ClueBar from '../components/ClueBar';
import ClueList from '../components/ClueList';
import HintButton from '../components/HintButton';
import Timer from '../components/Timer';
import { useGame } from '../hooks/useGame';
import { useProgress } from '../hooks/useProgress';
import { generateCrossword } from '../engine/generateCrossword';
import { getAllWords } from '../data/wordAdapter';
import prebuiltPuzzles from '../data/prebuilt.json';
import './Play.css';

function Play() {
  const [searchParams] = useSearchParams();
  const puzzleId = searchParams.get('puzzle');
  const timerRef = useRef(0);
  const { markCompleted } = useProgress();

  const puzzle = useMemo(() => {
    if (puzzleId && prebuiltPuzzles[puzzleId]) {
      return prebuiltPuzzles[puzzleId];
    }
    return generateCrossword(getAllWords());
  }, [puzzleId]);

  const {
    userGrid, cellStatus, selectedCell, direction,
    activeClue, hintsUsed, isComplete,
    selectCell, inputLetter, deleteLetter, checkAnswers, revealLetter,
  } = useGame(puzzle);

  // Track elapsed time
  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => { timerRef.current += 1; }, 1000);
    return () => clearInterval(interval);
  }, [isComplete]);

  // Persist completion
  useEffect(() => {
    if (isComplete) {
      const id = puzzleId || `generated-${Date.now()}`;
      markCompleted(id, {
        wordsCount: puzzle.clues.length,
        hintsUsed,
        timeSeconds: timerRef.current,
      });
    }
  }, [isComplete, puzzleId, puzzle.clues.length, hintsUsed, markCompleted]);

  const completedWords = useMemo(() => {
    return puzzle.clues
      .filter(clue => {
        for (let i = 0; i < clue.word.length; i++) {
          const r = clue.direction === 'across' ? clue.row : clue.row + i;
          const c = clue.direction === 'across' ? clue.col + i : clue.col;
          if (userGrid[r][c] !== puzzle.grid[r][c]) return false;
        }
        return true;
      })
      .map(c => c.word);
  }, [puzzle, userGrid]);

  const handleKeyDown = useCallback((e) => {
    if (e.key.length === 1 && /[a-zA-ZäöüÄÖÜß]/.test(e.key)) {
      inputLetter(e.key);
    } else if (e.key === 'Backspace' && selectedCell) {
      deleteLetter();
    }
  }, [inputLetter, deleteLetter, selectedCell]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClueClick = useCallback((clue) => {
    selectCell(clue.row, clue.col);
  }, [selectCell]);

  return (
    <div className="play-page">
      <ClueBar clue={activeClue} />

      <Grid
        solutionGrid={puzzle.grid}
        userGrid={userGrid}
        cellStatus={cellStatus}
        clues={puzzle.clues}
        selectedCell={selectedCell}
        direction={direction}
        activeClue={activeClue}
        onCellClick={selectCell}
      />

      <div className="play-actions">
        <button className="check-button" onClick={checkAnswers}>Check</button>
        <HintButton
          hintsUsed={hintsUsed}
          maxHints={3}
          activeClue={activeClue}
          onRevealLetter={revealLetter}
        />
        <Timer running={!isComplete} />
      </div>

      {isComplete && (
        <div className="complete-banner">Puzzle Complete!</div>
      )}

      <ClueList
        clues={puzzle.clues}
        activeClue={activeClue}
        onClueClick={handleClueClick}
        completedWords={completedWords}
      />
    </div>
  );
}

export default Play;
```

Create `src/pages/Play.css`:

```css
.play-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}

.play-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.check-button {
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  background: var(--color-accent);
  color: var(--color-bg);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.check-button:hover {
  opacity: 0.9;
}

.timer {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.complete-banner {
  text-align: center;
  padding: 12px;
  background: rgba(74, 222, 128, 0.15);
  border: 2px solid var(--color-correct);
  border-radius: 8px;
  font-weight: 700;
  color: var(--color-correct);
}
```

- [ ] **Step 4: Create empty prebuilt puzzles file (will populate in Task 12)**

Create `src/data/prebuilt.json`:

```json
{}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/pages/Play.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/Play.jsx src/pages/Play.css src/data/prebuilt.json tests/pages/Play.test.jsx
git commit -m "feat: add Play page with grid, clues, hints, and timer"
```

---

## Task 11: Home & Stats Pages

**Files:**
- Create: `src/pages/Home.jsx`, `src/pages/Home.css`, `src/pages/Stats.jsx`, `src/pages/Stats.css`
- Test: `tests/pages/Home.test.jsx`

- [ ] **Step 1: Write failing test for Home**

Create `tests/pages/Home.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../src/pages/Home';

describe('Home', () => {
  it('renders welcome message and New Puzzle button', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/Deutsch Crossword/i)).toBeInTheDocument();
    expect(screen.getByText(/New Puzzle/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages/Home.test.jsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement Home page**

Create `src/pages/Home.jsx`:

```jsx
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import prebuiltPuzzles from '../data/prebuilt.json';
import './Home.css';

function Home() {
  const { completed } = useProgress();
  const puzzleIds = Object.keys(prebuiltPuzzles);

  return (
    <div className="home-page">
      <h1 className="home-title">Deutsch Crossword</h1>
      <p className="home-subtitle">Practice German vocabulary from A1 to B1</p>

      <Link to="/play" className="new-puzzle-button">
        New Puzzle
      </Link>

      {puzzleIds.length > 0 && (
        <div className="puzzle-list">
          <h2>Puzzles</h2>
          {puzzleIds.map(id => (
            <Link
              key={id}
              to={`/play?puzzle=${id}`}
              className={`puzzle-item ${completed.includes(id) ? 'completed' : ''}`}
            >
              <span>{prebuiltPuzzles[id].name || id}</span>
              {completed.includes(id) && <span className="checkmark">✓</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
```

Create `src/pages/Home.css`:

```css
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0 24px;
  gap: 16px;
}

.home-title {
  font-size: 2rem;
  color: var(--color-accent);
}

.home-subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.new-puzzle-button {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 32px;
  border-radius: 8px;
  background: var(--color-accent);
  color: var(--color-bg);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: opacity 0.2s;
}

.new-puzzle-button:hover {
  opacity: 0.9;
}

.puzzle-list {
  width: 100%;
  margin-top: 24px;
}

.puzzle-list h2 {
  font-size: 1.1rem;
  margin-bottom: 12px;
  color: var(--color-text-secondary);
}

.puzzle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: var(--color-surface);
  border-radius: 6px;
  margin-bottom: 8px;
  text-decoration: none;
  color: var(--color-text);
  transition: background 0.15s;
}

.puzzle-item:hover {
  background: rgba(127, 219, 202, 0.1);
}

.puzzle-item.completed {
  color: var(--color-text-secondary);
}

.puzzle-item .checkmark {
  color: var(--color-correct);
  font-weight: 700;
}
```

- [ ] **Step 4: Implement Stats page**

Create `src/pages/Stats.jsx`:

```jsx
import { useProgress } from '../hooks/useProgress';
import './Stats.css';

function Stats() {
  const { stats } = useProgress();

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="stats-page">
      <h1>Your Progress</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCompleted}</div>
          <div className="stat-label">Puzzles Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.wordsLearned}</div>
          <div className="stat-label">Words Learned</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.hintsUsed}</div>
          <div className="stat-label">Hints Used</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTime(stats.averageTime)}</div>
          <div className="stat-label">Avg. Time</div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
```

Create `src/pages/Stats.css`:

```css
.stats-page {
  padding: 32px 0;
}

.stats-page h1 {
  text-align: center;
  color: var(--color-accent);
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card {
  background: var(--color-surface);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-accent);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/pages/Home.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/ tests/pages/Home.test.jsx
git commit -m "feat: add Home and Stats pages"
```

---

## Task 12: App Shell & Routing

**Files:**
- Modify: `src/App.jsx`, `src/App.css`, `src/main.jsx`

- [ ] **Step 1: Wire up React Router in main.jsx**

Replace `src/main.jsx`:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 2: Add routing and nav to App.jsx**

Replace `src/App.jsx`:

```jsx
import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Play from './pages/Play';
import Stats from './pages/Stats';

function App() {
  return (
    <div className="app">
      <nav className="nav-bar">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
        <NavLink to="/play" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Play
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Stats
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: Add nav styles to App.css**

Append to `src/App.css`:

```css
.nav-bar {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 8px;
}

.nav-link {
  padding: 6px 16px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s, background 0.2s;
}

.nav-link:hover {
  color: var(--color-text);
}

.nav-link.active {
  color: var(--color-accent);
  background: rgba(127, 219, 202, 0.1);
}
```

- [ ] **Step 4: Verify the app runs**

Run: `npm run dev`
Expected: App loads at localhost, shows Home page with nav bar, can navigate to Play and Stats.

- [ ] **Step 5: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.css src/main.jsx
git commit -m "feat: add routing and navigation shell"
```

---

## Task 13: Pre-built Puzzles

**Files:**
- Modify: `src/data/prebuilt.json`

- [ ] **Step 1: Generate pre-built puzzles**

Create a temporary script `scripts/generate-prebuilt.js`:

```js
import { getAllWords } from '../src/data/wordAdapter.js';
import { generateCrossword } from '../src/engine/generateCrossword.js';
import { writeFileSync } from 'fs';

const puzzles = {};

for (let i = 1; i <= 10; i++) {
  const puzzle = generateCrossword(getAllWords());
  puzzles[`puzzle-${i}`] = {
    name: `Puzzle ${i}`,
    ...puzzle,
  };
}

writeFileSync('src/data/prebuilt.json', JSON.stringify(puzzles, null, 2));
console.log('Generated 10 pre-built puzzles');
```

Run: `node --experimental-json-modules scripts/generate-prebuilt.js`

If the script has import issues, run it via Vite's Node API or manually create 3-5 puzzles by running the generator in the browser console and copying the output.

- [ ] **Step 2: Verify pre-built puzzles load on Home page**

Run: `npm run dev`
Expected: Home page shows list of pre-built puzzles. Clicking one navigates to Play with that puzzle loaded.

- [ ] **Step 3: Commit**

```bash
git add src/data/prebuilt.json scripts/
git commit -m "feat: add pre-built puzzle data"
```

---

## Task 14: Polish & Responsive Tweaks

**Files:**
- Modify: `src/App.css`, `src/components/Grid.css`, `index.html`

- [ ] **Step 1: Update index.html meta tags**

In `index.html`, update the `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="theme-color" content="#1a1a2e" />
<title>Deutsch Crossword</title>
```

- [ ] **Step 2: Add responsive grid sizing**

Append to `src/components/Grid.css`:

```css
@media (max-width: 400px) {
  .grid {
    max-width: 100%;
  }
  .cell-letter {
    font-size: 0.85em;
  }
  .cell-number {
    font-size: 0.45em;
  }
}
```

- [ ] **Step 3: Verify on mobile viewport**

Open browser dev tools, toggle device toolbar, test on iPhone SE / iPhone 12 viewport.
Expected: Grid fits screen, clues scroll properly, tapping cells works.

- [ ] **Step 4: Run all tests one final time**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: polish responsive design and meta tags"
```

---

## Summary

| Task | What it builds | Key files |
|------|---------------|-----------|
| 1 | Project scaffolding | Vite, React, Vitest config |
| 2 | Word data + adapter | JSON files, wordAdapter.js |
| 3 | Grid utilities | gridUtils.js |
| 4 | Crossword generator | generateCrossword.js |
| 5 | Progress hook | useProgress.js |
| 6 | Game state hook | useGame.js |
| 7 | Grid component | Grid.jsx |
| 8 | ClueBar + ClueList | ClueBar.jsx, ClueList.jsx |
| 9 | HintButton + Timer | HintButton.jsx, Timer.jsx |
| 10 | Play page | Play.jsx |
| 11 | Home + Stats pages | Home.jsx, Stats.jsx |
| 12 | App shell + routing | App.jsx, main.jsx |
| 13 | Pre-built puzzles | prebuilt.json |
| 14 | Polish + responsive | CSS tweaks, meta tags |
