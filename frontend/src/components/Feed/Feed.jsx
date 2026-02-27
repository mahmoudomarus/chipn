import React, { useState } from 'react';
import { ArrowUp, DollarSign, FileText } from 'lucide-react';

const DUMMY_FEED = [
    { id: 1, title: 'AI FARMING DRONES', summary: 'AI summary: Autonomous drones optimizing water usage. High scalability.', type: 'idea' },
    { id: 2, title: 'SWISS UI FRAMEWORK', summary: 'AI summary: A strict 2-color framework for rapid SaaS deployment.', type: 'product' },
    { id: 3, title: 'I NEED A TIME ORG APP', summary: 'AI summary: User requested an app that forces strict time boxing.', type: 'request' }
];

export default function Feed() {
    const [items] = useState(DUMMY_FEED);

    const handleSupport = () => {
        alert("Opening investment / due diligence modal");
    };

    return (
        <div className="feed-container">
            {items.map((item) => (
                <div key={item.id} className="feed-item">
                    <div style={{ maxWidth: '800px', width: '100%', padding: '32px' }}>
                        <div style={{ fontWeight: 900, marginBottom: '16px', display: 'inline-block', border: '4px solid black', padding: '4px 8px' }}>
                            {item.type.toUpperCase()}
                        </div>

                        <h1 style={{ fontSize: '5rem', wordBreak: 'break-word' }}>{item.title}</h1>

                        <div className="border-box mb-4" style={{ backgroundColor: '#f0f0f0', border: 'none', borderLeft: '8px solid black' }}>
                            <p style={{ margin: 0, fontWeight: 700 }}><span style={{ color: '#666' }}>AI NOTE:</span> {item.summary}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <ArrowUp size={24} strokeWidth={3} /> BOOST
                            </button>
                            <button
                                onClick={handleSupport}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'white', color: 'black' }}
                            >
                                {item.type === 'request' ? <FileText size={24} strokeWidth={3} /> : <DollarSign size={24} strokeWidth={3} />}
                                {item.type === 'request' ? 'BUILD IT' : 'INVEST / DD'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
