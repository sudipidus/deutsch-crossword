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
