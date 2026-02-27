import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Submit() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ type: 'idea', title: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setMessage("You must be logged in to submit.");
            return;
        }

        setLoading(true);
        setMessage('Generating AI Summary...');

        try {
            // 1. Get Summary from Anthropic via backend
            const sumRes = await fetch(`http://localhost:8000/ai/summarize?content=${encodeURIComponent(formData.title + ' - ' + formData.description)}`, { method: 'POST' });
            if (!sumRes.ok) throw new Error("Failed to generate AI summary.");
            const { summary } = await sumRes.json();

            setMessage('Saving to Database...');

            // 2. Post to DB via backend
            const postRes = await fetch('http://localhost:8000/posts/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author_id: user.id,
                    type: formData.type,
                    title: formData.title,
                    description: formData.description,
                    ai_summary: summary
                })
            });

            if (!postRes.ok) throw new Error("Failed to save post to database.");

            setMessage('Successfully Submitted! AI Analysis complete. Redirecting to feed...');
            setTimeout(() => navigate('/feed'), 2000);

        } catch (error) {
            setMessage(`Error: ${error.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <h1>Submit</h1>
            <p>Pitch an idea, showcase a product, or request an engineer to build something.</p>

            <form onSubmit={handleSubmit} className="border-box mt-4">
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    {['idea', 'product', 'request'].map((type) => (
                        <label key={type} style={{ fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="radio"
                                name="type"
                                value={type}
                                checked={formData.type === type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            />
                            {type.toUpperCase()}
                        </label>
                    ))}
                </div>

                <input
                    type="text"
                    placeholder="TITLE"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
                <textarea
                    placeholder="DESCRIPTION (BE SPECIFIC)"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />

                <button type="submit" disabled={loading} style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'PROCESSING...' : 'SUBMIT TO AI'}
                </button>
            </form>

            {message && (
                <div className="border-box mt-4" style={{ backgroundColor: message.includes('Error') ? '#ffdddd' : '#ddffdd', borderColor: message.includes('Error') ? '#cc0000' : '#00cc00' }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>{message}</p>
                </div>
            )}
        </div>
    );
}
