import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/Navigation/NavBar';
import Profile from './components/Profile/Profile';
import Auth from './components/Forms/Auth';
import Submit from './components/Forms/Submit';
import Feed from './components/Feed/Feed';
import Search from './components/Search/Search';
import './App.css';

function Home() {
  return (
    <div style={{ paddingTop: 64 }}>
      {/* Hero — full viewport, flush-left, asymmetric */}
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'grid',
        gridTemplateColumns: '1fr',
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: '0 calc(var(--sp) * 6)',
        alignItems: 'center',
      }}>
        <div style={{ maxWidth: 860 }} className="animate-fade-up">
          {/* Overline */}
          <div className="label" style={{ color: 'var(--red)', marginBottom: 'calc(var(--sp) * 3)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 32, height: 2, background: 'var(--red)', verticalAlign: 'middle' }} />
            Crowdfunding, reimagined
          </div>

          {/* Headline — dramatic scale */}
          <h1 style={{
            fontSize: 'clamp(3.5rem, 8vw, 7.5rem)',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            marginBottom: 'calc(var(--sp) * 5)',
          }}>
            Fund Ideas.<br />
            <span style={{ color: 'var(--red)' }}>Scroll</span> the<br />
            Future.
          </h1>

          {/* Rule with sub-text — Swiss editorial layout */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'calc(var(--sp) * 6)', marginBottom: 'calc(var(--sp) * 7)' }}>
            <div style={{ width: 2, background: 'var(--black)', alignSelf: 'stretch', flexShrink: 0 }} />
            <p style={{
              fontSize: 'var(--text-md)',
              fontWeight: 300,
              lineHeight: 1.65,
              color: 'var(--gray-600)',
              maxWidth: 480,
              margin: 0,
            }}>
              Pitch an idea in seconds. AI generates an investor-ready summary.
              Investors scroll and fund — everything in one fluid, verified ecosystem.
            </p>
          </div>

          {/* CTA Row */}
          <div style={{ display: 'flex', gap: 'calc(var(--sp) * 2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/feed">
              <button className="btn-red" style={{ padding: '16px 40px', fontSize: 'var(--text-sm)' }}>
                Browse the Feed →
              </button>
            </Link>
            <Link to="/auth">
              <button className="btn-outline" style={{ padding: '16px 40px', fontSize: 'var(--text-sm)' }}>
                Join Platform
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar — thin top border, no cards */}
      <div style={{ borderTop: '1px solid var(--gray-200)', padding: 'calc(var(--sp) * 5) calc(var(--sp) * 6)' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'calc(var(--sp) * 4)' }}>
          {[
            { num: '2,400+', label: 'Ideas Submitted' },
            { num: '$1.8M', label: 'Total Invested' },
            { num: '900+', label: 'Verified Founders' },
          ].map(s => (
            <div key={s.label} style={{ borderLeft: '3px solid var(--gray-200)', paddingLeft: 'calc(var(--sp) * 3)' }}>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.num}</div>
              <div className="label" style={{ marginTop: 6, color: 'var(--gray-400)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
