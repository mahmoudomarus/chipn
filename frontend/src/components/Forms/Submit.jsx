import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Package, Wrench, Check } from 'lucide-react';

const TYPES = [
    { key: 'idea', label: 'Idea', Icon: Lightbulb, desc: 'An innovative concept' },
    { key: 'product', label: 'Product', Icon: Package, desc: 'A built or in-progress product' },
    { key: 'request', label: 'Request', Icon: Wrench, desc: 'Need someone to build this' },
];

const INITIAL = {
    type: 'idea', title: '', description: '',
    video_url: '', deck_url: '', product_url: '',
};

export default function Submit() {
    const { user, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState('idle'); // idle | summarizing | saving | done | error
    const [aiSummary, setAiSummary] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const MAX = 1500;

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/auth'); return; }
        setLoading(true); setStage('summarizing');
        try {
            const sumRes = await fetch(
                `http://localhost:8000/ai/summarize?content=${encodeURIComponent(form.title + ' — ' + form.description)}`,
                { method: 'POST', headers: getAuthHeaders() }
            );
            if (!sumRes.ok) throw new Error('AI summarization failed.');
            const { summary } = await sumRes.json();
            setAiSummary(summary); setStage('saving');

            const body = { ai_summary: summary };
            for (const k of ['type', 'title', 'description', 'video_url', 'deck_url', 'product_url']) {
                if (form[k]) body[k] = form[k];
            }

            const postRes = await fetch('http://localhost:8000/posts/', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            if (!postRes.ok) throw new Error('Failed to save post.');
            setStage('done');
        } catch (err) {
            setErrMsg(err.message); setStage('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: 64, minHeight: '100vh' }}>
            <div className="submit-grid" style={{
                maxWidth: 'var(--container)', margin: '0 auto',
                padding: 'calc(var(--sp) * 8) calc(var(--sp) * 6)',
                display: 'grid',
                gridTemplateColumns: '5fr 7fr',
                gap: 'calc(var(--sp) * 12)',
                alignItems: 'flex-start',
            }}>

                {/* LEFT — type selector + context */}
                <div className="animate-fade-up">
                    <div className="label" style={{ color: 'var(--red)', marginBottom: 'calc(var(--sp) * 3)', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ width: 20, height: 2, background: 'var(--red)', display: 'inline-block' }} />
                        New Pitch
                    </div>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 'calc(var(--sp) * 3)' }}>
                        Pitch an idea.<br />AI writes the<br />summary.
                    </h2>
                    <p style={{ fontWeight: 300, lineHeight: 1.75, marginBottom: 'calc(var(--sp) * 5)' }}>
                        Add a video intro (YouTube URL or direct MP4), pitch deck, and product link — investors can swipe right to invest.
                    </p>

                    {/* Type selector */}
                    <div style={{ borderTop: '1px solid var(--gray-200)' }}>
                        {TYPES.map(({ key, label, Icon, desc }) => {
                            const active = form.type === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => set('type', key)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: 'calc(var(--sp) * 2.5) 0',
                                        background: 'transparent',
                                        color: active ? 'var(--black)' : 'var(--gray-400)',
                                        borderBottom: '1px solid var(--gray-200)',
                                        borderTop: 'none',
                                        borderLeft: active ? '3px solid var(--red)' : '3px solid transparent',
                                        paddingLeft: active ? 12 : 0,
                                        borderRadius: 0,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        width: '100%',
                                        transition: 'all var(--ease)',
                                    }}
                                >
                                    <Icon size={14} strokeWidth={active ? 2.5 : 1.5} />
                                    <div>
                                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 2 }}>{desc}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT — form */}
                <div className="animate-fade-up">
                    {stage !== 'done' ? (
                        <form onSubmit={handleSubmit}>
                            {/* Core fields */}
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input type="text" placeholder="A clear, punchy title" value={form.title}
                                    onChange={e => set('title', e.target.value)} required maxLength={120}
                                    style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }} />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Description</span>
                                    <span style={{ color: form.description.length > MAX * 0.9 ? 'var(--red)' : 'var(--gray-400)', fontFamily: 'var(--font)', textTransform: 'none', letterSpacing: 0, fontSize: 'var(--text-xs)' }}>
                                        {form.description.length} / {MAX}
                                    </span>
                                </label>
                                <textarea placeholder="Problem, solution, target market, traction…" rows={6}
                                    value={form.description} onChange={e => set('description', e.target.value)} required maxLength={MAX} />
                            </div>

                            {/* Media / links divider */}
                            <div style={{ borderTop: '2px solid var(--black)', paddingTop: 'calc(var(--sp) * 3)', marginBottom: 'calc(var(--sp) * 3)' }}>
                                <div className="label" style={{ color: 'var(--gray-400)', marginBottom: 'calc(var(--sp) * 3)' }}>
                                    Media & Links — optional
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Pitch Video URL</label>
                                <input
                                    type="url"
                                    placeholder="YouTube watch URL or direct .mp4 link"
                                    value={form.video_url}
                                    onChange={e => set('video_url', e.target.value)}
                                />
                                <p className="text-xs text-muted" style={{ marginTop: 4 }}>60s–2min founder intro or product demo. Plays automatically in the feed.</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Pitch Deck URL</label>
                                <input
                                    type="url"
                                    placeholder="Notion, Docsend, Google Drive, PDF…"
                                    value={form.deck_url}
                                    onChange={e => set('deck_url', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Product / Landing Page URL</label>
                                <input
                                    type="url"
                                    placeholder="https://your-product.com"
                                    value={form.product_url}
                                    onChange={e => set('product_url', e.target.value)}
                                />
                            </div>

                            {/* Processing state */}
                            {loading && (
                                <div className="accent-left-blue" style={{ marginBottom: 20 }}>
                                    <div className="label" style={{ color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="spinner" style={{ borderTopColor: 'var(--blue)', borderColor: 'rgba(26,82,255,0.2)' }} />
                                        {stage === 'summarizing' ? 'Generating AI summary…' : 'Saving to database…'}
                                    </div>
                                </div>
                            )}
                            {stage === 'error' && (
                                <div style={{ borderTop: '2px solid var(--red)', paddingTop: 10, marginBottom: 16 }}>
                                    <p className="text-sm text-red">{errMsg}</p>
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="btn-primary w-full" style={{ padding: 15, fontSize: 'var(--text-xs)' }}>
                                {loading ? <span className="spinner" /> : 'Submit to AI →'}
                            </button>
                        </form>
                    ) : (
                        /* Success */
                        <div className="animate-fade-up">
                            <div style={{ width: 40, height: 40, background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'calc(var(--sp) * 3)' }}>
                                <Check size={20} color="white" strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>Pitch submitted.</h3>
                            <p style={{ fontWeight: 300, marginBottom: 'calc(var(--sp) * 4)' }}>Your idea is live on the feed.</p>
                            {aiSummary && (
                                <div className="accent-left-blue" style={{ marginBottom: 'calc(var(--sp) * 5)' }}>
                                    <div className="form-label" style={{ color: 'var(--blue)', marginBottom: 6 }}>AI Investor Summary</div>
                                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.75, fontStyle: 'italic', fontWeight: 300 }}>{aiSummary}</p>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 'var(--text-xs)' }} onClick={() => navigate('/feed')}>
                                    View in Feed →
                                </button>
                                <button className="btn-outline" style={{ padding: '12px 28px', fontSize: 'var(--text-xs)' }} onClick={() => { setStage('idle'); setForm(INITIAL); setAiSummary(''); setErrMsg(''); }}>
                                    Submit Another
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
