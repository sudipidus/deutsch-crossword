import React from 'react';
import './Grid.css';

export default function Grid({
  solutionGrid,
  userGrid,
  cellStatus,
  clues,
  selectedCell,
  direction,
  activeClue,
  lockedCells,
  onCellClick,
}) {
  const rows = solutionGrid.length;
  const cols = solutionGrid[0].length;

  // Build a map of clue numbers by (row, col)
  const clueNumberMap = {};
  clues.forEach((clue) => {
    const key = `${clue.row}-${clue.col}`;
    clueNumberMap[key] = clue.number;
  });

  // Determine which cells belong to the active clue
  const highlightedCells = new Set();
  if (activeClue) {
    const { row, col, word, direction: clueDir } = activeClue;
    for (let i = 0; i < word.length; i++) {
      const r = clueDir === 'across' ? row : row + i;
      const c = clueDir === 'across' ? col + i : col;
      highlightedCells.add(`${r}-${c}`);
    }
  }

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isBlack = solutionGrid[r][c] === null;
      const key = `${r}-${c}`;
      const isSelected =
        selectedCell && selectedCell.row === r && selectedCell.col === c;
      const isHighlighted = highlightedCells.has(key);
      const isLocked = lockedCells && lockedCells[r][c];
      const status = cellStatus[r][c];
      const clueNumber = clueNumberMap[key];
      const letter = userGrid[r][c];

      const classNames = ['grid-cell'];
      if (isBlack) classNames.push('black');
      if (isSelected) classNames.push('selected');
      if (isHighlighted && !isSelected) classNames.push('highlighted');
      if (isLocked) classNames.push('locked');
      if (status === 'correct') classNames.push('correct');
      if (status === 'wrong') classNames.push('wrong');

      cells.push(
        <div
          key={key}
          className={classNames.join(' ')}
          onClick={() => {
            if (!isBlack) onCellClick(r, c);
          }}
        >
          {clueNumber && <span className="cell-number">{clueNumber}</span>}
          {!isBlack && <span className="cell-letter">{letter}</span>}
        </div>
      );
    }
  }

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {cells}
    </div>
  );
}
