import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/Navigation/NavBar';
import Profile from './components/Profile/Profile';

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
    <AuthProvider>
      <Router>
        <NavBar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
