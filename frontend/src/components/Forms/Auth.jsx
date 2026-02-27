import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Auth() {
    const [formData, setFormData] = useState({ email: '', password: '', idDocument: null });
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
                setMessage('Successfully logged in!');
            } else {
                // ID document upload would go to a storage bucket here before signup
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
                setMessage('Registration successful! Please check your email for verification.');
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <h1>{isLogin ? 'Login' : 'Signup'}</h1>
            <p>ID Verification is strictly required to join.</p>

            <form onSubmit={handleSubmit} className="border-box mt-4">
                <input
                    type="email"
                    placeholder="EMAIL"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="PASSWORD"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />

                {!isLogin && (
                    <div className="mb-4">
                        <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px' }}>UPLOAD ID DOCUMENT</label>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setFormData({ ...formData, idDocument: e.target.files[0] })}
                            required
                        />
                    </div>
                )}

                <button type="submit" disabled={loading} style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'PROCESSING...' : (isLogin ? 'ENTER PLATFORM' : 'VERIFY & REGISTER')}
                </button>
            </form>

            {message && (
                <div className="border-box mt-4" style={{ backgroundColor: message.includes('Error') ? '#ffdddd' : '#ddffdd', borderColor: message.includes('Error') ? '#cc0000' : '#00cc00' }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>{message}</p>
                </div>
            )}

            <div className="text-center mt-4">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ background: 'transparent', color: 'black', border: 'none', textDecoration: 'underline' }}
                >
                    {isLogin ? 'NEED AN ACCOUNT? SIGNUP' : 'ALREADY VERIFIED? LOGIN'}
                </button>
            </div>
        </div>
    );
}
