import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowUp, DollarSign, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Feed() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePost, setActivePost] = useState(null);
    const [amount, setAmount] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        async function loadFeed() {
            try {
                const res = await fetch('http://localhost:8000/feed/');
                if (!res.ok) throw new Error("Failed to load feed data.");
                const data = await res.json();
                setItems(data.items);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadFeed();
    }, []);

    const handleSupportClick = (item) => {
        if (!user) {
            alert("You must be logged in to invest or support.");
            navigate('/auth');
            return;
        }
        setActivePost(item);
    };

    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/investments/?investor_id=${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: activePost.id, amount: Number(amount) })
            });
            if (!res.ok) throw new Error("Failed to submit support");

            alert(activePost.type === 'request' ? "Thanks for pledging to build this!" : "Investment registered successfully!");
            setActivePost(null);
            setAmount('');
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}><h2>LOADING FEED...</h2></div>;
    if (error) return <div className="container" style={{ textAlign: 'center', padding: '100px 0', color: 'red' }}><h2>ERROR: {error}</h2></div>;
    if (items.length === 0) return <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}><h2>NO IDEAS SUBMITTED YET. BE THE FIRST!</h2></div>;

    return (
        <div className="feed-container" style={{ position: 'relative' }}>
            {items.map((item) => (
                <div key={item.id} className="feed-item">
                    <div style={{ maxWidth: '800px', width: '100%', padding: '32px' }}>
                        <div style={{ fontWeight: 900, marginBottom: '16px', display: 'inline-block', border: '4px solid black', padding: '4px 8px' }}>
                            {item.type.toUpperCase()}
                        </div>

                        <h1 style={{ fontSize: '4rem', wordBreak: 'break-word', margin: '0 0 16px 0' }}>{item.title}</h1>

                        <div className="border-box mb-4" style={{ backgroundColor: '#f0f0f0', border: 'none', borderLeft: '8px solid black' }}>
                            <p style={{ margin: 0, fontWeight: 700 }}><span style={{ color: '#666' }}>AI NOTE:</span> {item.ai_summary || "No summary available."}</p>
                        </div>

                        <p style={{ fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6, color: '#333' }}>
                            {item.description}
                        </p>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <ArrowUp size={24} strokeWidth={3} /> BOOST
                            </button>
                            <button
                                onClick={() => handleSupportClick(item)}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'white', color: 'black' }}
                            >
                                {item.type === 'request' ? <FileText size={24} strokeWidth={3} /> : <DollarSign size={24} strokeWidth={3} />}
                                {item.type === 'request' ? 'BUILD IT' : 'INVEST / DD'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {activePost && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
                    <div className="border-box" style={{ backgroundColor: 'white', maxWidth: '500px', width: '100%', position: 'relative' }}>
                        <button
                            onClick={() => setActivePost(null)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', padding: 0, width: 'auto' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginTop: 0 }}>{activePost.type === 'request' ? 'COMMIT TO BUILD' : 'INITIATE INVESTMENT'}</h2>
                        <p style={{ fontWeight: 600 }}>{activePost.title}</p>

                        <form onSubmit={handleSupportSubmit} style={{ marginTop: '24px' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>
                                {activePost.type === 'request' ? 'COMMITMENT ESTIMATE (USD)' : 'INVESTMENT AMOUNT (USD)'}
                            </label>
                            <input
                                type="number"
                                placeholder="AMOUNT"
                                min="1"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />

                            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                                Note: Amounts over $10,000 will require a separate Due Diligence document upload.
                            </p>

                            <button type="submit" disabled={submitLoading} style={{ width: '100%', marginTop: '16px', opacity: submitLoading ? 0.7 : 1 }}>
                                {submitLoading ? 'PROCESSING...' : 'CONFIRM'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
