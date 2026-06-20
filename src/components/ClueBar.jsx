import { useRef, useEffect } from 'react';
import './ClueBar.css';

// Keep the bar at the top of the *visible* area. On iOS/WebKit the layout
// viewport stays full-height when the keyboard opens, so `position: sticky`
// alone pins the bar off-screen. visualViewport.offsetTop tells us how far the
// visible region has shifted; we translate the bar down to compensate.
function useVisualViewportPin(ref) {
  useEffect(() => {
    const vv = window.visualViewport;
    const el = ref.current;
    if (!vv || !el) return;
    const update = () => {
      el.style.transform = vv.offsetTop ? `translateY(${vv.offsetTop}px)` : '';
    };
    update();
    vv.addEventListener('scroll', update);
    vv.addEventListener('resize', update);
    return () => {
      vv.removeEventListener('scroll', update);
      vv.removeEventListener('resize', update);
    };
  });
}

export default function ClueBar({ clue, direction, onToggleDirection, onPrevClue, onNextClue }) {
  const barRef = useRef(null);
  useVisualViewportPin(barRef);

  if (!clue) {
    return (
      <div className="clue-bar clue-bar--empty" ref={barRef}>
        <span className="clue-placeholder">Tap a cell to begin</span>
      </div>
    );
  }

  const levelClass = `level-badge level-${clue.level.toLowerCase()}`;
  const dirIcon = direction === 'across' ? '\u2192' : '\u2193';

  return (
    <div className="clue-bar" ref={barRef}>
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
