export function createGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export function canPlaceWord(grid, word, row, col, direction) {
  const rows = grid.length;
  const cols = grid[0].length;

  // Check cell before the word is empty (no unintended extension)
  const beforeR = direction === 'across' ? row : row - 1;
  const beforeC = direction === 'across' ? col - 1 : col;
  if (beforeR >= 0 && beforeC >= 0 && grid[beforeR][beforeC] !== null) return false;

  // Check cell after the word is empty
  const afterR = direction === 'across' ? row : row + word.length;
  const afterC = direction === 'across' ? col + word.length : col;
  if (afterR < rows && afterC < cols && grid[afterR][afterC] !== null) return false;

  for (let i = 0; i < word.length; i++) {
    const r = direction === 'across' ? row : row + i;
    const c = direction === 'across' ? col + i : col;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    const existing = grid[r][c];
    if (existing !== null && existing !== word[i]) return false;

    const isIntersection = existing === word[i] && existing !== null;

    // For non-intersection cells, check perpendicular neighbors are empty
    if (!isIntersection) {
      if (direction === 'across') {
        if (r - 1 >= 0 && grid[r - 1][c] !== null) return false;
        if (r + 1 < rows && grid[r + 1][c] !== null) return false;
      } else {
        if (c - 1 >= 0 && grid[r][c - 1] !== null) return false;
        if (c + 1 < cols && grid[r][c + 1] !== null) return false;
      }
    }
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
