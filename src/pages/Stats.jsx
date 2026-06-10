import { useProgress } from '../hooks/useProgress';
import './Stats.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Stats() {
  const { stats } = useProgress();

  return (
    <div className="stats-page">
      <h1 className="stats-title">Your Stats</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCompleted}</div>
          <div className="stat-label">Puzzles Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.wordsLearned}</div>
          <div className="stat-label">Words Learned</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.hintsUsed}</div>
          <div className="stat-label">Hints Used</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTime(stats.averageTime)}</div>
          <div className="stat-label">Avg. Time</div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
