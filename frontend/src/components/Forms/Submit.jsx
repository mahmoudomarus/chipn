import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Package, Wrench, Check, Upload, X, FileText, Film } from 'lucide-react';

const TYPES = [
    { key: 'idea', label: 'Idea', Icon: Lightbulb, desc: 'An innovative concept' },
    { key: 'product', label: 'Product', Icon: Package, desc: 'A built or in-progress product' },
    { key: 'request', label: 'Request', Icon: Wrench, desc: 'Need someone to build this' },
];

const INITIAL = { type: 'idea', title: '', description: '', product_url: '' };

const API = 'http://localhost:8000';

/* ─── File Drop Zone ─────────────────────────────────────────────── */
function FileDropZone({ label, accept, maxMB, uploadPath, getAuthHeaders, onUploaded, Icon: IconC }) {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);   // 0-100
    const [done, setDone] = useState(null); // uploaded filename
    const [error, setError] = useState('');

    const upload = useCallback(async (file) => {
        setUploading(true);
        setProgress(10);
        setError('');
        try {
            const fd = new FormData();
            fd.append('file', file);

            // XHR for real progress events
            const url = await new Promise((res, rej) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${API}${uploadPath}`);
                const headers = getAuthHeaders();
                // XHR doesn't support Content-Type multipart — omit it, browser sets boundary
                Object.entries(headers).forEach(([k, v]) => {
                    if (k.toLowerCase() !== 'content-type') xhr.setRequestHeader(k, v);
                });
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90));
                };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const data = JSON.parse(xhr.responseText);
                        res(data.url);
                    } else {
                        rej(new Error(xhr.responseText || 'Upload failed'));
                    }
                };
                xhr.onerror = () => rej(new Error('Network error'));
                xhr.send(fd);
            });

            setProgress(100);
            setDone(file.name);
            onUploaded(url);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }, [uploadPath, getAuthHeaders, onUploaded]);

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
    };

    const onFileInput = (e) => {
        const file = e.target.files[0];
        if (file) upload(file);
    };

    const clear = () => { setDone(null); setProgress(0); setError(''); onUploaded(''); };

    return (
        <div>
            <label className="form-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconC size={11} /> {label} <span style={{ color: 'var(--gray-400)', textTransform: 'none', letterSpacing: 0 }}>— max {maxMB}MB</span>
            </label>

            {done ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1.5px solid var(--gray-200)', background: 'var(--gray-100)' }}>
                    <Check size={13} color="var(--green)" strokeWidth={2.5} />
                    <span style={{ fontSize: 'var(--text-sm)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{done}</span>
                    <button onClick={clear} className="btn-ghost" style={{ padding: 2 }}><X size={12} /></button>
                </div>
            ) : (
                <label
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '24px 16px',
                        border: `1.5px dashed ${dragOver ? 'var(--black)' : 'var(--gray-200)'}`,
                        background: dragOver ? 'var(--gray-100)' : 'transparent',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        transition: 'all var(--ease)',
                        gap: 8,
                    }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                >
                    <input type="file" accept={accept} onChange={onFileInput} disabled={uploading} style={{ display: 'none' }} />
                    {uploading ? (
                        <>
                            <span className="label" style={{ color: 'var(--gray-400)' }}>Uploading…</span>
                            <div style={{ width: '100%', height: 2, background: 'var(--gray-200)', maxWidth: 200 }}>
                                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--red)', transition: 'width 0.3s ease' }} />
                            </div>
                        </>
                    ) : (
                        <>
                            <Upload size={16} color="var(--gray-400)" />
                            <span className="label" style={{ color: 'var(--gray-400)' }}>Drop here or click to browse</span>
                        </>
                    )}
                </label>
            )}

            {error && <p className="text-xs text-red" style={{ marginTop: 4 }}>{error}</p>}
        </div>
    );
}

/* ─── Submit Form ────────────────────────────────────────────────── */
export default function Submit() {
    const { user, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL);
    const [videoUrl, setVideoUrl] = useState('');
    const [deckUrl, setDeckUrl] = useState('');
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
                `${API}/ai/summarize?content=${encodeURIComponent(form.title + ' — ' + form.description)}`,
                { method: 'POST', headers: getAuthHeaders() }
            );
            if (!sumRes.ok) throw new Error('AI summarization failed.');
            const { summary } = await sumRes.json();
            setAiSummary(summary); setStage('saving');

            const body = { ai_summary: summary };
            for (const k of ['type', 'title', 'description']) {
                if (form[k]) body[k] = form[k];
            }
            if (videoUrl) body.video_url = videoUrl;
            if (deckUrl) body.deck_url = deckUrl;
            if (form.product_url) body.product_url = form.product_url;

            const postRes = await fetch(`${API}/posts/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            if (!postRes.ok) throw new Error(`Failed to submit: ${await postRes.text()}`);
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
                display: 'grid', gridTemplateColumns: '5fr 7fr',
                gap: 'calc(var(--sp) * 12)', alignItems: 'flex-start',
            }}>

                {/* LEFT — type selector */}
                <div className="animate-fade-up">
                    <div className="label" style={{ color: 'var(--red)', marginBottom: 'calc(var(--sp) * 3)', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ width: 20, height: 2, background: 'var(--red)', display: 'inline-block' }} />
                        New Pitch
                    </div>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 'calc(var(--sp) * 3)' }}>
                        Pitch an idea.<br />AI writes the<br />summary.
                    </h2>
                    <p style={{ fontWeight: 300, lineHeight: 1.75, marginBottom: 'calc(var(--sp) * 5)' }}>
                        Upload a 60s–2min video intro. Add your deck and product link. Investors swipe right to invest.
                    </p>
                    <div style={{ borderTop: '1px solid var(--gray-200)' }}>
                        {TYPES.map(({ key, label, Icon, desc }) => {
                            const active = form.type === key;
                            return (
                                <button key={key} type="button" onClick={() => set('type', key)} style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: 'calc(var(--sp) * 2.5) 0',
                                    background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left',
                                    color: active ? 'var(--black)' : 'var(--gray-400)',
                                    borderTop: 'none', borderRight: 'none', borderBottom: '1px solid var(--gray-200)',
                                    borderLeft: active ? '3px solid var(--red)' : '3px solid transparent',
                                    paddingLeft: active ? 12 : 0,
                                    borderRadius: 0, transition: 'all var(--ease)',
                                }}>
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
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input type="text" placeholder="One punchy sentence" value={form.title}
                                    onChange={e => set('title', e.target.value)} required maxLength={120}
                                    style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }} />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Description</span>
                                    <span style={{ color: form.description.length > MAX * 0.9 ? 'var(--red)' : 'var(--gray-400)', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--font)', fontSize: 'var(--text-xs)' }}>
                                        {form.description.length} / {MAX}
                                    </span>
                                </label>
                                <textarea placeholder="Problem, solution, market, traction…" rows={6}
                                    value={form.description} onChange={e => set('description', e.target.value)} required maxLength={MAX} />
                            </div>

                            <div style={{ borderTop: '2px solid var(--black)', paddingTop: 'calc(var(--sp) * 3)', marginBottom: 'calc(var(--sp) * 3)' }}>
                                <div className="label" style={{ color: 'var(--gray-400)', marginBottom: 'calc(var(--sp) * 3)' }}>Media & Links — optional</div>
                            </div>

                            <div className="form-group">
                                <FileDropZone
                                    label="Pitch Video"
                                    accept="video/mp4,video/quicktime,video/webm"
                                    maxMB={150}
                                    uploadPath="/uploads/video"
                                    getAuthHeaders={getAuthHeaders}
                                    onUploaded={setVideoUrl}
                                    Icon={Film}
                                />
                                <p className="text-xs text-muted" style={{ marginTop: 6 }}>60s–2min founder intro or demo. Plays automatically in the feed.</p>
                            </div>

                            <div className="form-group">
                                <FileDropZone
                                    label="Pitch Deck"
                                    accept=".pdf,.pptx,.ppt,.key"
                                    maxMB={20}
                                    uploadPath="/uploads/deck"
                                    getAuthHeaders={getAuthHeaders}
                                    onUploaded={setDeckUrl}
                                    Icon={FileText}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Product / Landing Page URL</label>
                                <input type="url" placeholder="https://your-product.com" value={form.product_url}
                                    onChange={e => set('product_url', e.target.value)} />
                            </div>

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
                                <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 'var(--text-xs)' }} onClick={() => navigate('/feed')}>View in Feed →</button>
                                <button className="btn-outline" style={{ padding: '12px 28px', fontSize: 'var(--text-xs)' }} onClick={() => { setStage('idle'); setForm(INITIAL); setVideoUrl(''); setDeckUrl(''); setAiSummary(''); setErrMsg(''); }}>Submit Another</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
