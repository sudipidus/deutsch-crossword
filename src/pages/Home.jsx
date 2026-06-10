import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import './Home.css';

function Home() {
  const { stats } = useProgress();

  return (
    <div className="home-page">
      <h1 className="home-title">Deutsch Crossword</h1>
      <p className="home-subtitle">Practice German vocabulary from A1 to B1</p>
      <p className="home-description">
        1,145 words across A1, A2 and B1 levels. Each puzzle is randomly generated
        with a mix of difficulties. Half the letters are pre-filled to help you learn.
      </p>
      <Link to="/play" className="new-puzzle-button">Play</Link>
      {stats.totalCompleted > 0 && (
        <p className="home-stats">
          {stats.totalCompleted} puzzle{stats.totalCompleted !== 1 ? 's' : ''} completed
          {' \u00B7 '}
          {stats.wordsLearned} words learned
        </p>
      )}
    </div>
  );
}

export default Home;
