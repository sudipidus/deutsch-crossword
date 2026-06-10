import { useState, useCallback } from 'react';

const STORAGE_KEY = 'deutsch-crossword-progress';

function loadProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    // Corrupted data, reset
  }
  return {
    completed: [],
    stats: { totalCompleted: 0, wordsLearned: 0, hintsUsed: 0, averageTime: 0 },
  };
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  const [progress, setProgress] = useState(loadProgress);

  const markCompleted = useCallback((puzzleId, { wordsCount, hintsUsed, timeSeconds }) => {
    setProgress(prev => {
      if (prev.completed.includes(puzzleId)) return prev;
      const newCompleted = [...prev.completed, puzzleId];
      const totalCompleted = newCompleted.length;
      const totalTime = prev.stats.averageTime * prev.stats.totalCompleted + timeSeconds;
      const newProgress = {
        completed: newCompleted,
        stats: {
          totalCompleted,
          wordsLearned: prev.stats.wordsLearned + wordsCount,
          hintsUsed: prev.stats.hintsUsed + hintsUsed,
          averageTime: Math.round(totalTime / totalCompleted),
        },
      };
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  return {
    completed: progress.completed,
    stats: progress.stats,
    markCompleted,
  };
}
