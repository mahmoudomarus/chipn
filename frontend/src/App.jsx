import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      <h1>CHIPN</h1>
      <p>Fund ideas. Submit products. Scroll the future.</p>

      <div className="grid">
        <div style={{ gridColumn: 'span 12' }}>
          <Link to="/feed">
            <button style={{ width: '100%' }}>Enter Feed</button>
          </Link>
        </div>
        <div style={{ gridColumn: 'span 6' }}>
          <Link to="/auth">
            <button style={{ width: '100%' }} className="border-box">Log In / ID</button>
          </Link>
        </div>
        <div style={{ gridColumn: 'span 6' }}>
          <Link to="/submit">
            <button style={{ width: '100%' }} className="border-box">Submit Idea</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import Auth from './components/Forms/Auth';
import Submit from './components/Forms/Submit';
import Feed from './components/Feed/Feed';
import Search from './components/Search/Search';

function App() {
  return (
    <Router>
      <nav style={{ padding: '16px', borderBottom: '4px solid black', display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/" style={{ color: 'black', textDecoration: 'none', fontWeight: 900, fontSize: '1.5rem' }}>CHIPN</Link>
        <div>
          <Link to="/search" style={{ color: 'black', textDecoration: 'none', fontWeight: 700, marginRight: '16px' }}>SEARCH</Link>
          <Link to="/auth" style={{ color: 'black', textDecoration: 'none', fontWeight: 700 }}>LOGIN</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </Router>
  );
}

export default App;
