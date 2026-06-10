import { createGrid, canPlaceWord, placeWord } from './gridUtils';

function findIntersections(grid, word, gridSize) {
  const positions = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      for (const direction of ['across', 'down']) {
        if (!canPlaceWord(grid, word, row, col, direction)) continue;
        let intersections = 0;
        for (let i = 0; i < word.length; i++) {
          const r = direction === 'across' ? row : row + i;
          const c = direction === 'across' ? col + i : col;
          if (grid[r][c] === word[i]) intersections++;
        }
        const gridHasLetters = grid.some(r => r.some(c => c !== null));
        if (gridHasLetters && intersections === 0) continue;
        positions.push({ row, col, direction, intersections });
      }
    }
  }
  positions.sort((a, b) => b.intersections - a.intersections);
  return positions;
}

function attemptGeneration(wordEntries) {
  const gridSize = 13;
  const grid = createGrid(gridSize, gridSize);
  const placed = [];
  const sorted = [...wordEntries].sort((a, b) => b.word.length - a.word.length);
  for (const entry of sorted) {
    const word = entry.word.toUpperCase();
    if (placed.length === 0) {
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
  const sorted = [...placed].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });
  let number = 1;
  const numberMap = new Map();
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
    const shuffled = [...wordEntries].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 12);
    const { grid, placed } = attemptGeneration(selected);
    if (!bestResult || placed.length > bestResult.placed.length) {
      bestResult = { grid, placed };
    }
    if (placed.length >= 6) break;
  }
  const { grid: trimmedGrid, rowOffset, colOffset } = trimGrid(bestResult.grid);
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
