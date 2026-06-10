import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Play from './pages/Play';
import Stats from './pages/Stats';

function App() {
  return (
    <div className="app">
      <nav className="nav-bar">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
        <NavLink to="/play" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Play
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Stats
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </div>
  );
}

export default App;
