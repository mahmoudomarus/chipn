import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function NavBar() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (p) => location.pathname === p;

    return (
        <nav style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            zIndex: 100,
            height: 64,
            background: 'var(--white)',
            borderBottom: '1px solid var(--gray-200)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 calc(var(--sp) * 6)',
        }}>
            <div style={{ maxWidth: 'var(--container)', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Wordmark — bold, no logo icon needed */}
                <Link to="/" style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.03em', color: 'var(--black)' }}>
                    CHIP<span style={{ color: 'var(--red)' }}>N</span>
                </Link>

                {/* Nav links — text only, no backgrounds */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--sp) * 4)' }}>
                    {[
                        { to: '/feed', label: 'Feed' },
                        { to: '/search', label: 'Search' },
                    ].map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                color: isActive(link.to) ? 'var(--red)' : 'var(--gray-600)',
                                borderBottom: isActive(link.to) ? '2px solid var(--red)' : '2px solid transparent',
                                paddingBottom: 2,
                                transition: 'color var(--ease), border-color var(--ease)',
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--sp) * 2)' }}>
                    <button
                        className="btn-primary"
                        style={{ padding: '9px 20px', fontSize: 'var(--text-xs)' }}
                        onClick={() => navigate('/submit')}
                    >
                        + Pitch
                    </button>

                    {user ? (
                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Initial block — square, bold, Swiss */}
                            <div style={{
                                width: 34, height: 34,
                                background: 'var(--black)',
                                color: 'var(--white)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 900,
                                letterSpacing: '0.05em',
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}>
                                {user.email[0].toUpperCase()}
                            </div>
                        </Link>
                    ) : (
                        <Link to="/auth">
                            <button className="btn-ghost" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
                                Log In
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
