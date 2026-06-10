import React from 'react';
import './ClueBar.css';

export default function ClueBar({ clue, direction, onToggleDirection, onPrevClue, onNextClue }) {
  if (!clue) {
    return (
      <div className="clue-bar clue-bar--empty">
        <span className="clue-placeholder">Tap a cell to begin</span>
      </div>
    );
  }

  const levelClass = `level-badge level-${clue.level.toLowerCase()}`;
  const dirIcon = direction === 'across' ? '\u2192' : '\u2193';

  return (
    <div className="clue-bar">
      <button className="clue-nav-btn" onClick={onPrevClue} aria-label="Previous clue">&lsaquo;</button>
      <div className="clue-bar-content" onClick={onToggleDirection} title="Tap to toggle direction">
        <div className="clue-bar-top">
          <span className={levelClass}>{clue.level}</span>
          <span className="clue-label">
            {clue.number}{clue.direction === 'across' ? 'A' : 'D'}
          </span>
          <span className="clue-dir-icon">{dirIcon}</span>
          <span className="clue-text">{clue.clue}</span>
        </div>
        {clue.context && <span className="clue-context">{clue.context}</span>}
      </div>
      <button className="clue-nav-btn" onClick={onNextClue} aria-label="Next clue">&rsaquo;</button>
    </div>
  );
}
