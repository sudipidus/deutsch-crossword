import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import prebuiltPuzzles from '../data/prebuilt.json';
import './Home.css';

function Home() {
  const { completed } = useProgress();
  const puzzleEntries = Object.entries(prebuiltPuzzles);

  return (
    <div className="home-page">
      <h1 className="home-title">Deutsch Crossword</h1>
      <p className="home-subtitle">Practice German vocabulary from A1 to B1</p>
      <Link to="/play" className="new-puzzle-button">New Puzzle</Link>

      {puzzleEntries.length > 0 && (
        <ul className="puzzle-list">
          {puzzleEntries.map(([id, puzzle]) => (
            <li key={id} className="puzzle-list-item">
              <Link to={`/play?puzzle=${id}`} className="puzzle-link">
                <span className="puzzle-name">{puzzle.name || id}</span>
                {completed.includes(id) && (
                  <span className="puzzle-completed">Completed</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;
