import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    if (!user) {
        return (
            <div className="container" style={{ textAlign: 'center' }}>
                <h2>YOU NEED TO LOGIN TO VIEW THIS PAGE</h2>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <h1>MEMBER PROFILE</h1>

            <div className="border-box mt-4">
                <h3>ACCOUNT DETAILS</h3>
                <p style={{ margin: '8px 0', fontWeight: 600 }}>ID: {user.id}</p>
                <p style={{ margin: '8px 0', fontWeight: 600 }}>EMAIL: {user.email}</p>
                <p style={{ margin: '8px 0', fontWeight: 600 }}>STATUS: VERIFIED SECURE</p>
            </div>

            <div className="mt-4" style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => navigate('/submit')} style={{ flex: 1, backgroundColor: 'white', color: 'black' }}>
                    NEW SUBMISSION
                </button>
                <button onClick={handleLogout} style={{ flex: 1 }}>
                    LOG OUT
                </button>
            </div>
        </div>
    );
}
