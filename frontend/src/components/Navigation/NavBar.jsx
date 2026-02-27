import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function NavBar() {
    const { user } = useAuth();

    return (
        <nav style={{ padding: '16px', borderBottom: '4px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'black', textDecoration: 'none', fontWeight: 900, fontSize: '1.5rem' }}>CHIPN</Link>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Link to="/search" style={{ color: 'black', textDecoration: 'none', fontWeight: 700 }}>SEARCH</Link>
                {user ? (
                    <Link to="/profile" style={{ color: 'black', textDecoration: 'none', fontWeight: 700 }}>PROFILE</Link>
                ) : (
                    <Link to="/auth" style={{ color: 'black', textDecoration: 'none', fontWeight: 700 }}>LOGIN</Link>
                )}
            </div>
        </nav>
    );
}
