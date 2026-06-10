# Deutsch Crossword

A browser-based crossword puzzle app for learning German vocabulary, covering CEFR levels A1 through B1.

**[Play it live](https://sudipidus.github.io/deutsch-crossword/)**

## What It Does

Practice German vocabulary by solving crossword puzzles. Each clue gives you an English word and a German context sentence — you fill in the German word.

- **1,145 German words** across three CEFR levels (414 A1, 350 A2, 381 B1)
- **10 pre-built puzzles** plus unlimited randomly generated ones
- **50% pre-filled grid** — half the letters are given so you can focus on what you don't know
- **Hint system** — reveal a letter or see the article (der/die/das), up to 3 hints per puzzle
- **Progress tracking** — completed puzzles, words learned, hints used, and average time

## Screenshot

```
  ┌───┬───┬───┬───┬───┐
  │ A │ P │ F │ E │ L │  1 Across: apple (Der ___ ist rot.)
  ├───┼───┼───┼───┼───┤
  │   │   │   │   │   │
  ├───┼───┼───┼───┼───┤
  │ H │ A │ U │ S │   │  2 Across: house (Das ___ ist groß.)
  └───┴───┴───┴───┴───┘
```

## How to Play

1. **Select a cell** — click/tap any white cell to select it
2. **Type the answer** — fill in the German word using your keyboard
3. **Toggle direction** — tap the same cell again to switch between Across and Down
4. **Use hints** — click Hint to reveal a letter or see the article
5. **Check your answers** — click Check to see which letters are correct (green) or wrong (red)
6. **Level badges** — each clue shows its CEFR level: A1 (green), A2 (yellow), B1 (orange)

Pre-filled letters appear in gray and can't be edited — they're there to help you get started.

## Vocabulary Coverage

| Level | Words | Description |
|-------|-------|-------------|
| A1 | 414 | Beginner — family, food, colors, animals, household items, basic places |
| A2 | 350 | Elementary — travel, professions, health, emotions, hobbies, technology |
| B1 | 381 | Intermediate — abstract concepts, business, politics, environment, culture |

Each word includes:
- German word with article (der/die/das)
- English translation
- German context sentence with a blank to fill

## Tech Stack

- **React 18** with Vite
- **React Router** for navigation (HashRouter for GitHub Pages compatibility)
- **Vitest** + React Testing Library (39 tests)
- **CSS** with custom properties (dark theme, no framework)
- **localStorage** for progress persistence
- **Zero backend** — runs entirely in the browser

## Project Structure

```
src/
  components/     Grid, ClueBar, ClueList, HintButton, Timer
  data/           Word lists (a1.json, a2.json, b1.json), prebuilt puzzles
  engine/         Crossword generation algorithm, grid utilities
  hooks/          useGame (interaction state), useProgress (localStorage)
  pages/          Home, Play, Stats
```

## Crossword Generation

The generator uses a greedy algorithm with backtracking:

1. Select 8–12 random words from the A1/A2/B1 pool
2. Sort by length (longest first)
3. Place each word by finding the best intersection with already-placed words
4. Trim the grid to its bounding box and assign clue numbers
5. If fewer than 6 words placed, retry with a different selection (up to 3 attempts)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Deployment

The app auto-deploys to GitHub Pages on every push to `main` via GitHub Actions.

To deploy manually:

```bash
npm run build
# Upload the dist/ folder to any static hosting
```

## License

MIT
