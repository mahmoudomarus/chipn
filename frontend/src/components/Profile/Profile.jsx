import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, LogOut, PlusCircle } from 'lucide-react';

const STATUS_CFG = {
    approved: { tag: 'tag-approved', label: 'Approved' },
    pending_diligence: { tag: 'tag-pending', label: 'Pending Review' },
    in_review: { tag: 'tag-review', label: 'Under Review' },
};
const TYPE_CFG = {
    idea: { tag: 'tag-idea' },
    product: { tag: 'tag-product' },
    request: { tag: 'tag-request' },
};

const Tabs = [
    { key: 'pitches', label: 'Pitches' },
    { key: 'investments', label: 'Investments' },
    { key: 'settings', label: 'Settings' },
];

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('pitches');
    const [pitches, setPitches] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [loadingP, setLoadingP] = useState(false);
    const [loadingI, setLoadingI] = useState(false);

    const logout = async () => { await signOut(); navigate('/'); };

    useEffect(() => {
        if (!user || tab !== 'pitches' || pitches.length > 0) return;
        setLoadingP(true);
        fetch(`http://localhost:8000/posts/?author_id=${user.id}`)
            .then(r => r.ok ? r.json() : [])
            .then(d => setPitches(Array.isArray(d) ? d : []))
            .catch(() => setPitches([]))
            .finally(() => setLoadingP(false));
    }, [user, tab]);

    useEffect(() => {
        if (!user || tab !== 'investments' || investments.length > 0) return;
        setLoadingI(true);
        fetch(`http://localhost:8000/investments/?investor_id=${user.id}`)
            .then(r => r.ok ? r.json() : [])
            .then(d => setInvestments(Array.isArray(d) ? d : []))
            .catch(() => setInvestments([]))
            .finally(() => setLoadingI(false));
    }, [user, tab]);

    if (!user) {
        return (
            <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
                <h3>You need to be logged in.</h3>
                <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 'var(--text-xs)' }} onClick={() => navigate('/auth')}>Log In →</button>
            </div>
        );
    }

    const totalInvested = investments.reduce((s, i) => s + (i.amount || 0), 0);
    const initial = user.email[0].toUpperCase();

    return (
        <div style={{ paddingTop: 64, minHeight: '100vh' }}>
            <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'calc(var(--sp) * 6) calc(var(--sp) * 6) calc(var(--sp) * 10)' }}>

                {/* Header strip — thick top rule, flush left */}
                <div style={{ borderTop: '3px solid var(--black)', paddingTop: 'calc(var(--sp) * 4)', marginBottom: 'calc(var(--sp) * 6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'calc(var(--sp) * 3)' }}>
                        {/* Square avatar — bold, square, Swiss */}
                        <div style={{ width: 56, height: 56, background: 'var(--black)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xl)', fontWeight: 900, flexShrink: 0 }}>
                            {initial}
                        </div>
                        <div>
                            <h2 style={{ fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 6 }}>{user.email}</h2>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span className="tag tag-approved">Verified</span>
                            </div>
                        </div>
                    </div>
                    <button className="btn-outline" style={{ padding: '9px 20px', fontSize: 'var(--text-xs)', display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }} onClick={() => navigate('/submit')}>
                        <PlusCircle size={12} /> New Pitch
                    </button>
                </div>

                {/* Stats row — left-border rule style */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'calc(var(--sp) * 3)', marginBottom: 'calc(var(--sp) * 6)', borderBottom: '1px solid var(--gray-200)', paddingBottom: 'calc(var(--sp) * 6)' }}>
                    {[
                        { num: totalInvested ? `$${totalInvested.toLocaleString()}` : '$—', label: 'Total Invested' },
                        { num: pitches.length || '—', label: 'Pitches' },
                        { num: new Date(user.created_at || Date.now()).getFullYear(), label: 'Member Since' },
                    ].map(s => (
                        <div key={s.label} style={{ borderLeft: '3px solid var(--gray-200)', paddingLeft: 'calc(var(--sp) * 3)' }}>
                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.num}</div>
                            <div className="label" style={{ marginTop: 6, color: 'var(--gray-400)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tab bar — underline style */}
                <div style={{ display: 'flex', gap: 'calc(var(--sp) * 4)', borderBottom: '1px solid var(--gray-200)', marginBottom: 'calc(var(--sp) * 5)' }}>
                    {Tabs.map(({ key, label }) => (
                        <button key={key} onClick={() => setTab(key)} style={{
                            fontSize: 'var(--text-sm)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                            padding: '0 0 16px 0',
                            background: 'transparent', borderRadius: 0,
                            color: tab === key ? 'var(--black)' : 'var(--gray-400)',
                            borderBottom: `2px solid ${tab === key ? 'var(--black)' : 'transparent'}`,
                            marginBottom: -1,
                            cursor: 'pointer', transition: 'color var(--ease), border-color var(--ease)',
                        }}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Pitches Tab */}
                {tab === 'pitches' && (
                    <div>
                        {loadingP && <div style={{ padding: 'calc(var(--sp) * 4) 0' }}><span className="label text-muted">Loading…</span></div>}
                        {!loadingP && pitches.length === 0 && (
                            <div style={{ padding: 'calc(var(--sp) * 6) 0' }}>
                                <p style={{ fontWeight: 300 }}>You haven't submitted any pitches yet.</p>
                                <button className="btn-primary" style={{ padding: '10px 24px', fontSize: 'var(--text-xs)', marginTop: 16 }} onClick={() => navigate('/submit')}>Submit Your First Pitch →</button>
                            </div>
                        )}
                        {pitches.map((p, i) => {
                            const cfg = TYPE_CFG[p.type] || TYPE_CFG.idea;
                            return (
                                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 'calc(var(--sp) * 4)', padding: 'calc(var(--sp) * 4) 0', borderTop: i === 0 ? '2px solid var(--black)' : '1px solid var(--gray-200)', alignItems: 'flex-start' }}>
                                    <div>
                                        <span className={`tag ${cfg.tag}`}>{p.type}</span>
                                        <div className="label" style={{ marginTop: 8, color: 'var(--gray-400)' }}>
                                            {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 700, marginBottom: 6 }}>{p.title}</h4>
                                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 300, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {p.ai_summary || p.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Investments Tab */}
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

                {/* Settings Tab */}
                {tab === 'settings' && (
                    <div style={{ maxWidth: 480 }}>
                        <div style={{ borderTop: '2px solid var(--black)', paddingTop: 'calc(var(--sp) * 4)', marginBottom: 'calc(var(--sp) * 4)' }}>
                            <div className="form-label">Email Address</div>
                            <p style={{ fontWeight: 400, color: 'var(--black)', margin: 0 }}>{user.email}</p>
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
