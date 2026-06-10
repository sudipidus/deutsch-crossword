import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Grid from '../components/Grid';
import ClueBar from '../components/ClueBar';
import ClueList from '../components/ClueList';
import HintButton from '../components/HintButton';
import Timer from '../components/Timer';
import WordDetail from '../components/WordDetail';
import { useGame } from '../hooks/useGame';
import { useProgress } from '../hooks/useProgress';
import { generateCrossword } from '../engine/generateCrossword';
import { getAllWords } from '../data/wordAdapter';
import prebuiltPuzzles from '../data/prebuilt.json';
import './Play.css';

// Build a lookup map for word details
const wordDetailMap = new Map();
for (const w of getAllWords()) {
  wordDetailMap.set(w.word.toUpperCase(), w.details);
}

function Play() {
  const [searchParams] = useSearchParams();
  const puzzleId = searchParams.get('puzzle');
  const timerRef = useRef(0);
  const { markCompleted } = useProgress();
  const [detailClue, setDetailClue] = useState(null);

  const puzzle = useMemo(() => {
    if (puzzleId && prebuiltPuzzles[puzzleId]) {
      return prebuiltPuzzles[puzzleId];
    }
    return generateCrossword(getAllWords());
  }, [puzzleId]);

  const {
    userGrid, cellStatus, selectedCell, direction,
    activeClue, hintsUsed, isComplete, lockedCells,
    selectCell, inputLetter, deleteLetter, checkAnswers, revealLetter,
  } = useGame(puzzle);

  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => { timerRef.current += 1; }, 1000);
    return () => clearInterval(interval);
  }, [isComplete]);

  useEffect(() => {
    if (isComplete) {
      const id = puzzleId || `generated-${Date.now()}`;
      markCompleted(id, {
        wordsCount: puzzle.clues.length,
        hintsUsed,
        timeSeconds: timerRef.current,
      });
    }
  }, [isComplete, puzzleId, puzzle.clues.length, hintsUsed, markCompleted]);

  const completedWords = useMemo(() => {
    return puzzle.clues
      .filter(clue => {
        for (let i = 0; i < clue.word.length; i++) {
          const r = clue.direction === 'across' ? clue.row : clue.row + i;
          const c = clue.direction === 'across' ? clue.col + i : clue.col;
          if (userGrid[r][c] !== puzzle.grid[r][c]) return false;
        }
        return true;
      })
      .map(c => c.word);
  }, [puzzle, userGrid]);

  const handleKeyDown = useCallback((e) => {
    if (detailClue) return; // don't type while modal is open
    if (e.key.length === 1 && /[a-zA-ZäöüÄÖÜß]/.test(e.key)) {
      inputLetter(e.key);
    } else if (e.key === 'Backspace' && selectedCell) {
      deleteLetter();
    } else if (e.key === 'Escape' && detailClue) {
      setDetailClue(null);
    }
  }, [inputLetter, deleteLetter, selectedCell, detailClue]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClueClick = useCallback((clue) => {
    selectCell(clue.row, clue.col, clue.direction);
  }, [selectCell]);

  const handleLearn = useCallback(() => {
    if (!activeClue) return;
    const details = wordDetailMap.get(activeClue.word);
    if (details) {
      setDetailClue({ ...activeClue, details });
    }
  }, [activeClue]);

  return (
    <div className="play-page">
      <ClueBar clue={activeClue} />
      <Grid
        solutionGrid={puzzle.grid}
        userGrid={userGrid}
        cellStatus={cellStatus}
        clues={puzzle.clues}
        selectedCell={selectedCell}
        direction={direction}
        activeClue={activeClue}
        lockedCells={lockedCells}
        onCellClick={selectCell}
      />
      <div className="play-actions">
        <button className="check-button" onClick={checkAnswers}>Check</button>
        <HintButton
          hintsUsed={hintsUsed}
          maxHints={3}
          activeClue={activeClue}
          onRevealLetter={revealLetter}
        />
        <button
          className="learn-button"
          onClick={handleLearn}
          disabled={!activeClue}
        >
          Learn
        </button>
        <Timer running={!isComplete} />
      </div>
      {isComplete && (
        <div className="complete-banner">Puzzle Complete!</div>
      )}
      <ClueList
        clues={puzzle.clues}
        activeClue={activeClue}
        onClueClick={handleClueClick}
        completedWords={completedWords}
      />
      {detailClue && (
        <WordDetail clue={detailClue} onClose={() => setDetailClue(null)} />
      )}
    </div>
  );
}

export default Play;
