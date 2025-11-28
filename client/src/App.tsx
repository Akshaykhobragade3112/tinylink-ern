import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container header-inner">
          <h1 className="logo">TinyLink</h1>
          <nav className="nav">
            <a href="/" className="nav-link">
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      <main className="container main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/code/:code" element={<Stats />} />
        </Routes>
      </main>
    </div>
  );
}
