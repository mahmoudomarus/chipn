import React, { useState } from 'react';

export default function Submit() {
    const [formData, setFormData] = useState({ type: 'idea', title: '', description: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Submitting content to the backend for AI summarization.');
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

                <button type="submit" style={{ width: '100%' }}>SUBMIT TO AI</button>
            </form>
        </div>
    );
}
