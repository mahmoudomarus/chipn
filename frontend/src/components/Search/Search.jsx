import React, { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

const TYPE_CFG = {
    idea: { tag: 'tag-idea' },
    product: { tag: 'tag-product' },
    request: { tag: 'tag-request' },
};

export default function Search() {
    const [query, setQuery] = useState('');
    const [isDeep, setIsDeep] = useState(false);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!query.trim()) return;
        setLoading(true); setError(''); setSearched(true);
        try {
            const res = await fetch(`http://localhost:8000/search/?query=${encodeURIComponent(query)}&deep=${isDeep}`);
            if (!res.ok) throw new Error('Search failed.');
            setResults(await res.json());
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const clear = () => { setQuery(''); setResults([]); setSearched(false); setError(''); };

    return (
        <div style={{ paddingTop: 64, minHeight: '100vh' }}>
            <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'calc(var(--sp) * 8) calc(var(--sp) * 6)' }}>

                {/* Header — asymmetric, large */}
                <div style={{ maxWidth: 600, marginBottom: 'calc(var(--sp) * 8)' }} className="animate-fade-up">
                    <div className="label" style={{ color: 'var(--red)', marginBottom: 'calc(var(--sp) * 2)', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ width: 20, height: 2, background: 'var(--red)', display: 'inline-block' }} />
                        Smart Search
                    </div>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em' }}>
                        Find ideas, products<br />and opportunities.
                    </h2>
                </div>

                {/* Search input + controls — inline, grid */}
                <div style={{ borderTop: '2px solid var(--black)', paddingTop: 'calc(var(--sp) * 3)', marginBottom: 'calc(var(--sp) * 3)' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search ideas, products, requests…"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                style={{ borderBottom: 'none', padding: '14px 0', fontSize: 'var(--text-md)', fontWeight: 400 }}
                            />
                        </div>
                        {query && (
                            <button type="button" className="btn-ghost" onClick={clear} style={{ color: 'var(--gray-400)', padding: '8px 12px' }}>
                                <X size={14} />
                            </button>
                        )}
                        <button type="submit" disabled={loading || !query.trim()} className="btn-primary" style={{ padding: '12px 28px', fontSize: 'var(--text-xs)', flexShrink: 0 }}>
                            {loading ? <span className="spinner" /> : 'Search →'}
                        </button>
                    </form>
                </div>

                {/* Deep search toggle — text button, no pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'calc(var(--sp) * 6)', borderBottom: '1px solid var(--gray-200)', paddingBottom: 'calc(var(--sp) * 3)' }}>
                    <button
                        type="button"
                        onClick={() => setIsDeep(d => !d)}
                        style={{
                            padding: 0,
                            background: 'transparent',
                            borderRadius: 0,
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: isDeep ? 'var(--blue)' : 'var(--gray-400)',
                            borderBottom: `2px solid ${isDeep ? 'var(--blue)' : 'transparent'}`,
                            paddingBottom: 2,
                            cursor: 'pointer',
                            transition: 'color var(--ease), border-color var(--ease)',
                        }}
                    >
                        <span style={{ width: 10, height: 10, border: `2px solid ${isDeep ? 'var(--blue)' : 'var(--gray-400)'}`, display: 'inline-block', background: isDeep ? 'var(--blue)' : 'transparent' }} />
                        AI Deep Search
                    </button>
                    {isDeep && (
                        <span className="text-xs text-muted">also searches AI summaries</span>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div style={{ borderTop: '2px solid var(--red)', paddingTop: 12, marginBottom: 'calc(var(--sp) * 4)' }}>
                        <p className="text-sm text-red">{error}</p>
                    </div>
                )}

                {/* Empty state */}
                {searched && !loading && results.length === 0 && !error && (
                    <div style={{ padding: 'calc(var(--sp) * 8) 0' }}>
                        <p style={{ fontWeight: 300 }}>No results for "<strong>{query}</strong>". Try enabling AI Deep Search for broader results.</p>
                    </div>
                )}

                {/* Results — list layout, no cards */}
                {results.length > 0 && (
                    <div>
                        <div className="label" style={{ marginBottom: 'calc(var(--sp) * 3)', color: 'var(--gray-400)' }}>
                            {results.length} result{results.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {results.map((r, i) => {
                                const cfg = TYPE_CFG[r.type] || TYPE_CFG.idea;
                                return (
                                    <div key={r.id} style={{
                                        padding: 'calc(var(--sp) * 4) 0',
                                        borderTop: i === 0 ? '2px solid var(--black)' : '1px solid var(--gray-200)',
                                        display: 'grid',
                                        gridTemplateColumns: '120px 1fr',
                                        gap: 'calc(var(--sp) * 4)',
                                        alignItems: 'flex-start',
                                    }}>
                                        {/* Left: type + date */}
                                        <div>
                                            <span className={`tag ${cfg.tag}`}>{r.type}</span>
                                            <div className="label" style={{ marginTop: 8, color: 'var(--gray-400)', letterSpacing: '0.06em' }}>
                                                {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        {/* Right: content */}
                                        <div>
                                            <h3 style={{ fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>{r.title}</h3>
                                            <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.7, fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {r.ai_summary || r.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
