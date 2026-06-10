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
          <button className="hint-option" onClick={() => { onRevealLetter(); setOpen(false); }} disabled={remaining <= 0}>
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
