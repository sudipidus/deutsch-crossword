# Deutsch Crossword App - Design Spec

## Overview

A client-side web app that helps German language learners (A1-B1) practice vocabulary through crossword puzzles. English clues with German context sentences lead to German word answers.

## Goals

- Help learners practice German vocabulary from A1 through B1 levels
- Provide both curated and auto-generated crossword puzzles
- Mobile-first, responsive design
- Zero backend — runs entirely in the browser

## Tech Stack

- **Framework:** React + Vite
- **Routing:** React Router
- **Styling:** CSS (no framework)
- **Storage:** localStorage for progress
- **Deployment:** Static site (GitHub Pages / Netlify / Vercel)

## Project Structure

```
src/
  components/       # React components (Grid, Clue, Hints, Stats)
  data/             # JSON word lists (a1.json, a2.json, b1.json)
  engine/           # Crossword generation algorithm
  hooks/            # Custom hooks (useGame, useProgress)
  pages/            # Home, Play, Stats
  utils/            # Helpers (localStorage, validation)
public/
```

## Word Data Model

Each word entry:

```json
{
  "word": "Apfel",
  "level": "A1",
  "clue": "apple",
  "context": "Der ___ ist rot.",
  "article": "der"
}
```

- `article` is optional — only present for nouns (null/omitted for verbs, adjectives, etc.)

- Words organized by level in separate files (`a1.json`, `a2.json`, `b1.json`)
- Merged at runtime behind an adapter interface
- Adapter makes it easy to swap JSON imports for API fetch calls later

## Crossword Generation

### Algorithm

1. Select ~8-12 words from the combined A1/A2/B1 pool (mixed difficulty)
2. Place the longest word first
3. For each remaining word, find valid intersections with already-placed words
4. Backtrack if placement fails
5. Score and select the best layout (most intersections, compact grid)

### Grid

- Size adapts to words chosen, typically 10x10 to 13x13
- Black cells for unused spaces
- Pre-built puzzles are pre-computed outputs of the same algorithm, stored as JSON

### Pre-built vs Generated

- Pre-built puzzles: ~10 curated puzzles shipped with the app as JSON
- Generated puzzles: new crossword created on demand using the algorithm above
- Both use the same data format and rendering

### Failure Handling

- If the generator cannot place at least 6 words, retry with a different word selection (up to 3 attempts)
- If all retries fail, fall back to a random pre-built puzzle

## UI Design

### Layout: Mobile-First Stacked

From top to bottom:

1. **Top bar** — App title, navigation (Home / Play / Stats)
2. **Active clue bar** — Current clue with level badge, e.g. `[A1] apple (Der ___ ist rot.)`
3. **Crossword grid** — Interactive grid, tap cell to select, highlights full word
4. **Clue list** — Tabbed (Across / Down), scrollable, tapping a clue selects that word

### Interaction

- Tap a cell to select it and its word
- Tap the same cell again to toggle direction (across/down)
- Type to fill letters; native keyboard on mobile, direct typing on desktop
- Completed clues show a checkmark in the clue list

### Color Coding

- Active word: highlighted border
- Correct (after check): green
- Wrong (after check): red
- Level badges: A1 = green, A2 = yellow, B1 = orange

## Hint System

Three hint types via a hint button:

- **Reveal letter** — fills in the current cell with the correct letter
- **Show article** — displays der/die/das for the current word (nouns only)
- **Show level** — visible via the badge on the active clue

Hints limited to 3 reveals per puzzle.

## Progress & Stats

Stored in localStorage:

```json
{
  "completed": ["puzzle-1", "puzzle-3"],
  "stats": {
    "totalCompleted": 2,
    "wordsLearned": 22,
    "hintsUsed": 5,
    "averageTime": 340
  }
}
```

### Stats Page Shows

- Puzzles completed (pre-built and generated)
- Words encountered by level (A1/A2/B1 breakdown)
- Hints used
- Average completion time

## Pages & Flow

### Home

- Welcome message
- "New Puzzle" button (generates a random crossword)
- List of pre-built puzzles with completion status

### Play

- The crossword game screen (layout described above)
- "Check" button to validate answers
- "Hint" button with dropdown for hint types
- Timer (optional display)

### Stats

- Progress dashboard with the metrics listed above

## Out of Scope (v1)

- User accounts / authentication
- Cross-device sync
- Multiplayer
- Custom word lists
- Spaced repetition
- Sound/pronunciation
