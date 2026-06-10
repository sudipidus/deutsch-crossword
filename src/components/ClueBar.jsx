import React from 'react';
import './ClueBar.css';

export default function ClueBar({ clue }) {
  if (!clue) {
    return (
      <div className="clue-bar clue-bar--empty">
        <span className="clue-placeholder">Select a cell to begin</span>
      </div>
    );
  }

  const levelClass = `level-badge level-${clue.level.toLowerCase()}`;

  return (
    <div className="clue-bar">
      <span className={levelClass}>{clue.level}</span>
      <span className="clue-label">
        {clue.number} {clue.direction.charAt(0).toUpperCase() + clue.direction.slice(1)}
      </span>
      <span className="clue-text">{clue.clue}</span>
      {clue.context && <span className="clue-context">{clue.context}</span>}
    </div>
  );
}
