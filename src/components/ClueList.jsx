import React, { useState } from 'react';
import './ClueList.css';

export default function ClueList({ clues, activeClue, onClueClick, completedWords }) {
  const [tab, setTab] = useState('across');

  const filtered = clues.filter((c) => c.direction === tab);
  const completedSet = new Set(completedWords);

  const isActive = (clue) =>
    activeClue &&
    activeClue.number === clue.number &&
    activeClue.direction === clue.direction;

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
        {filtered.map((clue) => (
          <div
            key={`${clue.direction}-${clue.number}`}
            className={`clue-item ${isActive(clue) ? 'clue-item--active' : ''} ${completedSet.has(clue.word) ? 'clue-item--completed' : ''}`}
            onClick={() => onClueClick(clue)}
          >
            <span className="clue-number">{clue.number}.</span>
            <span className="clue-text">{clue.clue}</span>
            {completedSet.has(clue.word) && <span className="clue-check">&#10003;</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
