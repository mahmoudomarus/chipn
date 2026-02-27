import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
    const [query, setQuery] = useState('');
    const [isDeepSearch, setIsDeepSearch] = useState(false);
    const [results, setResults] = useState([]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query) return;

        // Mock result logic
        setResults([
            { id: 1, title: `Result for "${query}"`, type: 'idea', summary: `Found via ${isDeepSearch ? 'Deep Search' : 'Text Search'}` }
        ]);
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <h1>Smart Search</h1>
            <p>Find specific ideas, products, or engineer requests.</p>

            <form onSubmit={handleSearch} className="border-box mt-4">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="ENTER SEARCH QUERY..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                    <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'auto' }}>
                        <SearchIcon size={24} strokeWidth={3} />
                    </button>
                </div>

                <label style={{ fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        checked={isDeepSearch}
                        onChange={(e) => setIsDeepSearch(e.target.checked)}
                    />
                    USE DEEP SEMANTIC SEARCH (AI)
                </label>
            </form>

            <div className="mt-4">
                {results.map(r => (
                    <div key={r.id} className="border-box mb-4">
                        <h3 style={{ margin: 0 }}>{r.title}</h3>
                        <p style={{ margin: '8px 0 0 0', fontWeight: 600 }}>TYPE: {r.type.toUpperCase()}</p>
                        <p style={{ margin: '8px 0 0 0' }}>{r.summary}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
