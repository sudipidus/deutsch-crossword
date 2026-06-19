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
import { getAllWords, getWordsByLevel } from '../data/wordAdapter';
import prebuiltPuzzles from '../data/prebuilt.json';
import './Play.css';

const LEVELS = ['A1', 'A2', 'B1', 'Mixed'];

const wordDetailMap = new Map();
for (const w of getAllWords()) {
  wordDetailMap.set(w.word.toUpperCase(), w.details);
}

function getWordsForLevel(level) {
  if (level === 'Mixed') return getAllWords();
  return getWordsByLevel(level);
}

function Play() {
  const [searchParams, setSearchParams] = useSearchParams();
  const puzzleId = searchParams.get('puzzle');
  const levelParam = searchParams.get('level');
  const [level, setLevel] = useState(
    LEVELS.includes(levelParam) ? levelParam : 'Mixed'
  );
  const [puzzleKey, setPuzzleKey] = useState(0);
  const timerRef = useRef(0);
  const { markCompleted } = useProgress();
  const [detailClue, setDetailClue] = useState(null);

  const handleLevelChange = useCallback((newLevel) => {
    setLevel(newLevel);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('level', newLevel);
      next.delete('puzzle');
      return next;
    });
    setPuzzleKey(k => k + 1);
    timerRef.current = 0;
  }, [setSearchParams]);

  const puzzle = useMemo(() => {
    if (puzzleId && prebuiltPuzzles[puzzleId]) {
      return prebuiltPuzzles[puzzleId];
    }
    return generateCrossword(getWordsForLevel(level));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleId, level, puzzleKey]);

  const {
    userGrid, cellStatus, selectedCell, direction,
    activeClue, hintsUsed, isComplete,
    selectCell, inputLetter, deleteLetter, checkAnswers, revealLetter,
  } = useGame(puzzle);

  // Sorted clue list for prev/next navigation
  const sortedClues = useMemo(() => {
    return [...puzzle.clues].sort((a, b) => {
      if (a.direction !== b.direction) return a.direction === 'across' ? -1 : 1;
      return a.number - b.number;
    });
  }, [puzzle.clues]);

  const activeClueIndex = useMemo(() => {
    if (!activeClue) return -1;
    return sortedClues.findIndex(
      c => c.number === activeClue.number && c.direction === activeClue.direction
    );
  }, [activeClue, sortedClues]);

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
    if (detailClue) return;
    // The Grid's hidden input handles its own typing/backspace. Ignore key
    // events originating from it so a single keystroke isn't processed twice
    // (once here on window, once by the input) and written to two cells.
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === 'Escape') {
      setDetailClue(null);
      return;
    }
    if (e.key.length === 1 && /[a-zA-ZäöüÄÖÜß]/.test(e.key)) {
      inputLetter(e.key);
    } else if (e.key === 'Backspace' && selectedCell) {
      deleteLetter();
    }
  }, [inputLetter, deleteLetter, selectedCell, detailClue]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClueClick = useCallback((clue) => {
    selectCell(clue.row, clue.col, clue.direction);
  }, [selectCell]);

  const handleToggleDirection = useCallback(() => {
    if (selectedCell) {
      selectCell(selectedCell.row, selectedCell.col);
    }
  }, [selectedCell, selectCell]);

  const handlePrevClue = useCallback(() => {
    if (sortedClues.length === 0) return;
    const idx = activeClueIndex <= 0 ? sortedClues.length - 1 : activeClueIndex - 1;
    const clue = sortedClues[idx];
    selectCell(clue.row, clue.col, clue.direction);
  }, [activeClueIndex, sortedClues, selectCell]);

  const handleNextClue = useCallback(() => {
    if (sortedClues.length === 0) return;
    const idx = activeClueIndex >= sortedClues.length - 1 ? 0 : activeClueIndex + 1;
    const clue = sortedClues[idx];
    selectCell(clue.row, clue.col, clue.direction);
  }, [activeClueIndex, sortedClues, selectCell]);

  const handleLearn = useCallback(() => {
    if (!activeClue) return;
    const details = wordDetailMap.get(activeClue.word);
    if (details) {
      setDetailClue({ ...activeClue, details });
    }
  }, [activeClue]);

  return (
    <div className="play-page">
      <div className="level-selector">
        {LEVELS.map(l => (
          <button
            key={l}
            className={`level-button${l === level ? ' level-active' : ''}`}
            onClick={() => handleLevelChange(l)}
          >
            {l}
          </button>
        ))}
      </div>
      <ClueBar
        clue={activeClue}
        direction={direction}
        onToggleDirection={handleToggleDirection}
        onPrevClue={handlePrevClue}
        onNextClue={handleNextClue}
      />
      <Grid
        solutionGrid={puzzle.grid}
        userGrid={userGrid}
        cellStatus={cellStatus}
        clues={puzzle.clues}
        selectedCell={selectedCell}
        direction={direction}
        activeClue={activeClue}
        onCellClick={selectCell}
        onInput={inputLetter}
        onDelete={deleteLetter}
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
