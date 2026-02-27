import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, LogOut, PlusCircle, Edit2, Check, X } from 'lucide-react';

const STATUS_CFG = {
    active: { tag: 'tag-approved', label: 'Active' },
    closed: { tag: 'tag-pending', label: 'Closed' },
    approved: { tag: 'tag-approved', label: 'Approved' },
    pending_diligence: { tag: 'tag-pending', label: 'Pending Review' },
    in_review: { tag: 'tag-review', label: 'Under Review' },
};
const TYPE_CFG = {
    idea: { tag: 'tag-idea' },
    product: { tag: 'tag-product' },
    request: { tag: 'tag-request' },
};

const API = 'http://localhost:8000';

const TABS = [
    { key: 'pitches', label: 'Pitches' },
    { key: 'inbound', label: 'Inbound' },
    { key: 'investments', label: 'Investments' },
    { key: 'settings', label: 'Settings' },
];

/* ─── Inline Pitch Editor ─────────────────────────────────────────── */
function PitchEditor({ pitch, onSave, onCancel, getAuthHeaders }) {
    const [form, setForm] = useState({
        video_url: pitch.video_url || '',
        deck_url: pitch.deck_url || '',
        product_url: pitch.product_url || '',
        status: pitch.status || 'active',
    });
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const body = {};
            for (const k of ['video_url', 'deck_url', 'product_url', 'status']) {
                if (form[k] !== undefined) body[k] = form[k] || null;
            }
            const res = await fetch(`${API}/posts/${pitch.id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(await res.text());
            onSave(await res.json());
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ marginTop: 12, padding: '16px 0', borderTop: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
                { k: 'video_url', label: 'Video URL', placeholder: 'YouTube or .mp4' },
                { k: 'deck_url', label: 'Deck URL', placeholder: 'Docsend, Notion, PDF…' },
                { k: 'product_url', label: 'Product URL', placeholder: 'https://…' },
            ].map(({ k, label, placeholder }) => (
                <div key={k} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{label}</label>
                    <input
                        type="url"
                        placeholder={placeholder}
                        value={form[k]}
                        onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                        style={{ fontSize: 'var(--text-sm)' }}
                    />
                </div>
            ))}
            <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Status</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['active', 'closed'].map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setForm(p => ({ ...p, status: s }))}
                            style={{
                                padding: '6px 14px',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                background: form.status === s ? 'var(--black)' : 'transparent',
                                color: form.status === s ? 'var(--white)' : 'var(--gray-400)',
                                border: `1.5px solid ${form.status === s ? 'var(--black)' : 'var(--gray-200)'}`,
                                borderRadius: 0,
                                cursor: 'pointer',
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                    onClick={save}
                    disabled={saving}
                    className="btn-primary"
                    style={{ padding: '8px 20px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    {saving ? <span className="spinner" /> : <><Check size={11} /> Save</>}
                </button>
                <button onClick={onCancel} className="btn-outline" style={{ padding: '8px 20px', fontSize: 'var(--text-xs)' }}>
                    <X size={11} />
                </button>
            </div>
        </div>
    );
}

/* ─── Profile ─────────────────────────────────────────────────────── */
export default function Profile() {
    const { user, signOut, getAuthHeaders } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState('pitches');
    const [pitches, setPitches] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [inbound, setInbound] = useState([]);
    const [loadingP, setLoadingP] = useState(false);
    const [loadingI, setLoadingI] = useState(false);
    const [loadingIb, setLoadingIb] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const logout = async () => { await signOut(); navigate('/'); };

    /* Pitches */
    useEffect(() => {
        if (!user || tab !== 'pitches' || pitches.length > 0) return;
        setLoadingP(true);
        fetch(`${API}/posts/?author_id=${user.id}`)
            .then(r => r.ok ? r.json() : [])
            .then(d => setPitches(Array.isArray(d) ? d : []))
            .catch(() => setPitches([]))
            .finally(() => setLoadingP(false));
    }, [user, tab]);

    /* Outbound investments — authenticated */
    useEffect(() => {
        if (!user || tab !== 'investments' || investments.length > 0) return;
        setLoadingI(true);
        fetch(`${API}/investments/?investor_id=${user.id}`, { headers: getAuthHeaders() })
            .then(r => r.ok ? r.json() : [])
            .then(d => setInvestments(Array.isArray(d) ? d : []))
            .catch(() => setInvestments([]))
            .finally(() => setLoadingI(false));
    }, [user, tab]);

    /* Inbound investments into founder's posts */
    useEffect(() => {
        if (!user || tab !== 'inbound' || inbound.length > 0) return;
        setLoadingIb(true);
        fetch(`${API}/investments/inbound`, { headers: getAuthHeaders() })
            .then(r => r.ok ? r.json() : [])
            .then(d => setInbound(Array.isArray(d) ? d : []))
            .catch(() => setInbound([]))
            .finally(() => setLoadingIb(false));
    }, [user, tab]);

    const handlePitchSave = useCallback((updated) => {
        setPitches(prev => prev.map(p => p.id === updated.id ? updated : p));
        setEditingId(null);
    }, []);

    if (!user) {
        return (
            <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
                <h3>You need to be logged in.</h3>
                <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 'var(--text-xs)' }} onClick={() => navigate('/auth')}>Log In →</button>
            </div>
        );
    }

    const totalInvested = investments.reduce((s, i) => s + (i.amount || 0), 0);
    const totalRaised = inbound.reduce((s, i) => s + (i.amount || 0), 0);
    const initial = user.email[0].toUpperCase();

    return (
        <div style={{ paddingTop: 64, minHeight: '100vh' }}>
            <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'calc(var(--sp) * 6) calc(var(--sp) * 6) calc(var(--sp) * 10)' }}>

                {/* Header strip */}
                <div style={{ borderTop: '3px solid var(--black)', paddingTop: 'calc(var(--sp) * 4)', marginBottom: 'calc(var(--sp) * 6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'calc(var(--sp) * 3)' }}>
                        <div style={{ width: 56, height: 56, background: 'var(--black)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xl)', fontWeight: 900, flexShrink: 0, letterSpacing: '-0.03em' }}>
                            {initial}
                        </div>
                        <div>
                            <h2 style={{ fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 6 }}>{user.email}</h2>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span className="tag tag-approved">Verified</span>
                            </div>
                        </div>
                    </div>
                    <button className="btn-outline" style={{ padding: '9px 20px', fontSize: 'var(--text-xs)', display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }} onClick={() => navigate('/submit')}>
                        <PlusCircle size={12} /> New Pitch
                    </button>
                </div>

                {/* Stats row */}
                <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'calc(var(--sp) * 3)', marginBottom: 'calc(var(--sp) * 6)', borderBottom: '1px solid var(--gray-200)', paddingBottom: 'calc(var(--sp) * 6)' }}>
                    {[
                        { num: pitches.length || '—', label: 'Pitches' },
                        { num: inbound.length ? `$${totalRaised.toLocaleString()}` : '$—', label: 'Total Raised' },
                        { num: totalInvested ? `$${totalInvested.toLocaleString()}` : '$—', label: 'Total Invested' },
                        { num: new Date(user.created_at || Date.now()).getFullYear(), label: 'Member Since' },
                    ].map(s => (
                        <div key={s.label} style={{ borderLeft: '3px solid var(--gray-200)', paddingLeft: 'calc(var(--sp) * 3)' }}>
                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.num}</div>
                            <div className="label" style={{ marginTop: 6, color: 'var(--gray-400)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tab bar */}
                <div style={{ display: 'flex', gap: 'calc(var(--sp) * 4)', borderBottom: '1px solid var(--gray-200)', marginBottom: 'calc(var(--sp) * 5)' }}>
                    {TABS.map(({ key, label }) => (
                        <button key={key} onClick={() => setTab(key)} style={{
                            fontSize: 'var(--text-sm)', fontWeight: 700, letterSpacing: '0.06em',
                            textTransform: 'uppercase', padding: '0 0 16px 0',
                            background: 'transparent', borderRadius: 0,
                            color: tab === key ? 'var(--black)' : 'var(--gray-400)',
                            borderBottom: `2px solid ${tab === key ? 'var(--black)' : 'transparent'}`,
                            marginBottom: -1, cursor: 'pointer', transition: 'all var(--ease)',
                        }}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Pitches Tab ── */}
                {tab === 'pitches' && (
                    <div>
                        {loadingP && <div style={{ padding: 'calc(var(--sp) * 4) 0' }}><span className="label text-muted">Loading…</span></div>}
                        {!loadingP && pitches.length === 0 && (
                            <div style={{ padding: 'calc(var(--sp) * 6) 0' }}>
                                <p style={{ fontWeight: 300 }}>No pitches yet.</p>
                                <button className="btn-primary" style={{ padding: '10px 24px', fontSize: 'var(--text-xs)', marginTop: 16 }} onClick={() => navigate('/submit')}>Submit Your First Pitch →</button>
                            </div>
                        )}
                        {pitches.map((p, i) => {
                            const cfg = TYPE_CFG[p.type] || TYPE_CFG.idea;
                            const sc = STATUS_CFG[p.status] || STATUS_CFG.active;
                            const isEditing = editingId === p.id;
                            return (
                                <div key={p.id} style={{ padding: 'calc(var(--sp) * 4) 0', borderTop: i === 0 ? '2px solid var(--black)' : '1px solid var(--gray-200)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 'calc(var(--sp) * 4)', alignItems: 'flex-start' }}>
                                        <div>
                                            <span className={`tag ${cfg.tag}`}>{p.type}</span>
                                            <div className="label" style={{ marginTop: 8, color: 'var(--gray-400)' }}>
                                                {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                            </div>
                                            <span className={`tag ${sc.tag}`} style={{ marginTop: 8, display: 'inline-block' }}>{sc.label}</span>
                                        </div>
                                        <div>
                                            <h4 style={{ fontWeight: 700, marginBottom: 6 }}>{p.title}</h4>
                                            <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 300, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {p.ai_summary || p.description}
                                            </p>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>
                                                <span>{p.boost_count || 0} boosts</span>
                                                {p.video_url && <span>· Video ✓</span>}
                                                {p.deck_url && <span>· Deck ✓</span>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setEditingId(isEditing ? null : p.id)}
                                            className="btn-ghost"
                                            style={{ color: isEditing ? 'var(--red)' : 'var(--gray-400)', padding: 4, marginTop: 2 }}
                                            title="Edit pitch"
                                        >
                                            {isEditing ? <X size={14} /> : <Edit2 size={14} />}
                                        </button>
                                    </div>
                                    {isEditing && (
                                        <PitchEditor
                                            pitch={p}
                                            getAuthHeaders={getAuthHeaders}
                                            onSave={handlePitchSave}
                                            onCancel={() => setEditingId(null)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Inbound Tab ── */}
                {tab === 'inbound' && (
                    <div>
                        {loadingIb && <div style={{ padding: 'calc(var(--sp) * 4) 0' }}><span className="label text-muted">Loading…</span></div>}
                        {!loadingIb && inbound.length === 0 && (
                            <div style={{ padding: 'calc(var(--sp) * 6) 0' }}>
                                <p style={{ fontWeight: 300 }}>No investments in your pitches yet.</p>
                            </div>
                        )}
                        {inbound.map((inv, i) => {
                            const sc = STATUS_CFG[inv.status] || STATUS_CFG.pending_diligence;
                            return (
                                <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 'calc(var(--sp) * 4)', padding: 'calc(var(--sp) * 4) 0', borderTop: i === 0 ? '2px solid var(--black)' : '1px solid var(--gray-200)', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                                            ${inv.amount?.toLocaleString()}
                                        </div>
                                        <div className="label" style={{ marginTop: 6, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={9} />
                                            {new Date(inv.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 4 }}>{inv.post_title}</div>
                                        <span className={`tag ${sc.tag}`}>{sc.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {inbound.length > 0 && (
                            <div className="accent-left-blue" style={{ marginTop: 'calc(var(--sp) * 5)' }}>
                                <div className="label" style={{ color: 'var(--blue)' }}>Total Raised</div>
                                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>${totalRaised.toLocaleString()}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Investments Tab ── */}
                {tab === 'investments' && (
                    <div>
                        {loadingI && <div style={{ padding: 'calc(var(--sp) * 4) 0' }}><span className="label text-muted">Loading…</span></div>}
                        {!loadingI && investments.length === 0 && (
                            <div style={{ padding: 'calc(var(--sp) * 6) 0' }}>
                                <p style={{ fontWeight: 300 }}>No investments yet.</p>
                                <button className="btn-primary" style={{ padding: '10px 24px', fontSize: 'var(--text-xs)', marginTop: 16 }} onClick={() => navigate('/feed')}>Browse the Feed →</button>
                            </div>
                        )}
                        {investments.map((inv, i) => {
                            const s = STATUS_CFG[inv.status] || STATUS_CFG.pending_diligence;
                            return (
                                <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 'calc(var(--sp) * 4)', padding: 'calc(var(--sp) * 4) 0', borderTop: i === 0 ? '2px solid var(--black)' : '1px solid var(--gray-200)', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                                            ${inv.amount?.toLocaleString()}
                                        </div>
                                        <div className="label" style={{ marginTop: 6, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={9} />
                                            {new Date(inv.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`tag ${s.tag}`}>{s.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Settings Tab ── */}
                {tab === 'settings' && (
                    <div style={{ maxWidth: 480 }}>
                        <div style={{ borderTop: '2px solid var(--black)', paddingTop: 'calc(var(--sp) * 4)', marginBottom: 'calc(var(--sp) * 4)' }}>
                            <div className="form-label">Email Address</div>
                            <p style={{ fontWeight: 400, margin: 0 }}>{user.email}</p>
                        </div>
                        <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'calc(var(--sp) * 4)', marginBottom: 'calc(var(--sp) * 6)' }}>
                            <div className="form-label">KYC Status</div>
                            <span className="tag tag-approved">Identity Verified</span>
                        </div>
                        <button className="btn-outline" style={{ padding: '10px 24px', fontSize: 'var(--text-xs)', color: 'var(--red)', borderColor: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }} onClick={logout}>
                            <LogOut size={13} /> Sign Out
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
