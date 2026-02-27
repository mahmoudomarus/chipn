import React, { useState } from 'react';

export default function Auth() {
    const [formData, setFormData] = useState({ email: '', password: '', idDocument: null });
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Submitting ${isLogin ? 'Login' : 'Signup'} with ID constraints.`);
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

                <button type="submit" style={{ width: '100%' }}>
                    {isLogin ? 'ENTER PLATFORM' : 'VERIFY & REGISTER'}
                </button>
            </form>

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
