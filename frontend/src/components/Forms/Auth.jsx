import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Upload, FileText, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
    const [tab, setTab] = useState('login');
    const [form, setForm] = useState({ email: '', password: '', idDocument: null });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', err: false });
    const [dragOver, setDragOver] = useState(false);
    const navigate = useNavigate();

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) set('idDocument', f);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', err: false });
        try {
            if (tab === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
                if (error) throw error;
                setMsg({ text: 'Logged in — redirecting…', err: false });
                setTimeout(() => navigate('/feed'), 900);
            } else {
                if (!form.idDocument) throw new Error('ID Document is required.');
                setMsg({ text: 'Uploading ID…', err: false });
                const ext = form.idDocument.name.split('.').pop();
                const name = `${Date.now()}_${Math.random().toString(36).slice(7)}.${ext}`;
                const { error: upErr, data } = await supabase.storage.from('documents').upload(`id_verifications/${name}`, form.idDocument);
                if (upErr) throw upErr;
                setMsg({ text: 'Creating account…', err: false });
                const { error } = await supabase.auth.signUp({
                    email: form.email, password: form.password,
                    options: { data: { id_document_path: data.path } },
                });
                if (error) throw error;
                setMsg({ text: 'Account created — check your email for verification.', err: false });
            }
        } catch (err) {
            setMsg({ text: err.message, err: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: 64, minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

            {/* LEFT: Large typographic brand panel */}
            <div style={{
                borderRight: '1px solid var(--gray-200)',
                padding: 'calc(var(--sp) * 10) calc(var(--sp) * 8)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }} className="hide-mobile">
                {/* Red overline */}
                <div className="label" style={{ color: 'var(--red)', marginBottom: 'calc(var(--sp) * 4)', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ width: 24, height: 2, background: 'var(--red)', display: 'inline-block' }} />
                    Verified access only
                </div>

                <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 'calc(var(--sp) * 4)' }}>
                    Every member<br />is KYC verified.
                </h2>

                <p style={{ fontWeight: 300, lineHeight: 1.75, maxWidth: 380, marginBottom: 'calc(var(--sp) * 6)' }}>
                    ID verification protects founders and investors alike.
                    Submit your government ID once — access the platform indefinitely.
                </p>

                {/* Feature list — typography only, no icons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--sp) * 2)' }}>
                    {['AI-generated investor summaries', 'KYC-verified community', 'Due diligence built-in for large investments'].map((f, i) => (
                        <div key={f} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--red)', fontWeight: 900, minWidth: 16 }}>0{i + 1}</span>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', fontWeight: 400 }}>{f}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Form */}
            <div style={{
                padding: 'calc(var(--sp) * 10) calc(var(--sp) * 8)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                maxWidth: 480,
                width: '100%',
                margin: '0 auto',
            }} className="animate-fade-up">

                {/* Tab toggle — text-based, underline active */}
                <div style={{ display: 'flex', gap: 'calc(var(--sp) * 4)', marginBottom: 'calc(var(--sp) * 6)', borderBottom: '1px solid var(--gray-200)', paddingBottom: 0 }}>
                    {[['login', 'Log In'], ['signup', 'Sign Up']].map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => { setTab(key); setMsg({ text: '', err: false }); }}
                            style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                padding: '0 0 16px 0',
                                background: 'transparent',
                                color: tab === key ? 'var(--black)' : 'var(--gray-400)',
                                borderBottom: `2px solid ${tab === key ? 'var(--black)' : 'transparent'}`,
                                marginBottom: -1,
                                borderRadius: 0,
                                cursor: 'pointer',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <h3 style={{ marginBottom: 'calc(var(--sp) * 5)', fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {tab === 'login' ? 'Welcome back.' : 'Create an account.'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" placeholder="you@example.com" required value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">Password</label>
                        <input
                            type={showPass ? 'text' : 'password'}
                            placeholder="Min. 8 characters"
                            required
                            value={form.password}
                            onChange={e => set('password', e.target.value)}
                            style={{ paddingRight: 40 }}
                        />
                        <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => setShowPass(p => !p)}
                            style={{ position: 'absolute', right: 0, bottom: 10, padding: '4px 8px', color: 'var(--gray-400)' }}
                        >
                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>

                    {tab === 'signup' && (
                        <div className="form-group">
                            <label className="form-label">Government ID Document</label>
                            <div
                                onDrop={onDrop}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onClick={() => document.getElementById('id-file-input').click()}
                                style={{
                                    border: `1.5px dashed ${dragOver ? 'var(--black)' : form.idDocument ? 'var(--black)' : 'var(--gray-200)'}`,
                                    padding: 'calc(var(--sp) * 4)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    background: dragOver ? 'var(--gray-100)' : 'transparent',
                                    transition: 'all var(--ease)',
                                }}
                            >
                                {form.idDocument ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                        <FileText size={16} />
                                        <span className="text-sm fw-700">{form.idDocument.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={20} color="var(--gray-400)" style={{ marginBottom: 8 }} />
                                        <p className="text-sm" style={{ margin: 0 }}>Drag & drop or click to upload</p>
                                        <p className="text-xs text-muted" style={{ marginTop: 4 }}>Passport, Driver's License, or National ID</p>
                                    </>
                                )}
                            </div>
                            <input id="id-file-input" type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => set('idDocument', e.target.files[0])} />
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary w-full" style={{ padding: 14, fontSize: 'var(--text-xs)', marginTop: 8 }}>
                        {loading ? <span className="spinner" /> : tab === 'login' ? 'Enter Platform →' : 'Verify & Register →'}
                    </button>
                </form>

                {msg.text && (
                    <div style={{
                        marginTop: 20,
                        padding: '10px 0',
                        borderTop: `2px solid ${msg.err ? 'var(--red)' : 'var(--black)'}`,
                        fontSize: 'var(--text-sm)',
                        color: msg.err ? 'var(--red)' : 'var(--black)',
                        fontWeight: 500,
                    }}>
                        {msg.text}
                    </div>
                )}
            </div>
        </div>
    );
}
