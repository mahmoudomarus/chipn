import React, {
    useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    ArrowUp, DollarSign, FileText, X, Check,
    ExternalLink, BookOpen, Info, ChevronUp, ChevronDown, Play, Pause,
    Volume2, VolumeX
} from 'lucide-react';

/* ─── Constants ──────────────────────────────────────────────────── */
const SWIPE_THRESHOLD = 80;  // px horizontal needed to trigger action
const API = 'http://localhost:8000';

const TYPE_CFG = {
    idea: { tag: 'tag-idea', label: 'Idea' },
    product: { tag: 'tag-product', label: 'Product' },
    request: { tag: 'tag-request', label: 'Request' },
};

const TIMER_DURATION = 120; // seconds

/* ─── Video Timer ────────────────────────────────────────────────── */
/**
 * Thin red progress bar at the top of the card.
 * Counts from TIMER_DURATION down to 0. On expiry, fires 'feed:advance' custom event.
 * Only renders when both `active` and `hasVideo` are true.
 */
function VideoTimer({ active, hasVideo, cardIndex }) {
    const [remaining, setRemaining] = useState(TIMER_DURATION);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!active || !hasVideo) {
            clearInterval(intervalRef.current);
            setRemaining(TIMER_DURATION);
            return;
        }
        intervalRef.current = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    window.dispatchEvent(new CustomEvent('feed:advance', { detail: { from: cardIndex } }));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [active, hasVideo, cardIndex]);

    if (!hasVideo) return null;

    const pct = (remaining / TIMER_DURATION) * 100;
    return (
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0, height: 2, zIndex: 30, background: 'rgba(255,255,255,0.1)' }}>
            <div style={{
                height: '100%',
                width: `${pct}%`,
                background: 'var(--red)',
                transition: 'width 1s linear',
            }} />
        </div>
    );
}


/* ─── Helpers ────────────────────────────────────────────────────── */
/**
 * Extracts a YouTube embed URL from a full YouTube watch URL or already-embed URL.
 * Returns null if the provided URL is not a YouTube link.
 */
function toYouTubeEmbed(url) {
    if (!url) return null;
    if (url.includes('youtube.com/embed/') || url.includes('youtu.be/embed/')) return url;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&controls=1&modestbranding=1&rel=0` : null;
}

function isDirectVideo(url) {
    if (!url) return false;
    return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
}

/* ─── Video Player ───────────────────────────────────────────────── */
function VideoPlayer({ url, active }) {
    const videoRef = useRef(null);
    const [muted, setMuted] = useState(true);
    const [playing, setPlaying] = useState(false);
    const embedUrl = useMemo(() => toYouTubeEmbed(url), [url]);

    // Autoplay native video when card is active
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        if (active) {
            v.play().then(() => setPlaying(true)).catch(() => { });
        } else {
            v.pause();
            v.currentTime = 0;
            setPlaying(false);
        }
    }, [active]);

    if (embedUrl) {
        // YouTube iframe — autoplay handled by URL params
        return (
            <iframe
                src={active ? embedUrl : embedUrl.replace('autoplay=1', 'autoplay=0')}
                title="Pitch video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', zIndex: 0 }}
            />
        );
    }

    if (isDirectVideo(url)) {
        return (
            <>
                <video
                    ref={videoRef}
                    src={url}
                    muted={muted}
                    loop
                    playsInline
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
                />
                {/* Native video controls overlay */}
                <div style={{ position: 'absolute', bottom: 100, left: 24, zIndex: 5, display: 'flex', gap: 12 }}>
                    <button
                        className="btn-ghost"
                        onClick={() => {
                            const v = videoRef.current;
                            if (!v) return;
                            if (playing) { v.pause(); setPlaying(false); }
                            else { v.play(); setPlaying(true); }
                        }}
                        style={{ color: 'white', padding: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 4 }}
                    >
                        {playing ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        className="btn-ghost"
                        onClick={() => setMuted(m => !m)}
                        style={{ color: 'white', padding: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 4 }}
                    >
                        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                </div>
            </>
        );
    }

    return null; // No video
}

/* ─── Post Detail Drawer ─────────────────────────────────────────── */
function PostDrawer({ post, onClose }) {
    const cfg = TYPE_CFG[post.type] || TYPE_CFG.idea;
    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 400,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'flex-end',
                animation: 'fadeIn 0.2s ease forwards',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%',
                    maxHeight: '80vh',
                    background: 'var(--white)',
                    overflowY: 'auto',
                    padding: '32px 40px 48px',
                    animation: 'slideUp 0.3s ease forwards',
                    borderTop: '3px solid var(--black)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div style={{ width: 40, height: 3, background: 'var(--gray-200)', margin: '0 auto 28px' }} />

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <span className={`tag ${cfg.tag}`}>{cfg.label}</span>
                        <h2 style={{ marginTop: 10, letterSpacing: '-0.03em' }}>{post.title}</h2>
                    </div>
                    <button className="btn-ghost" onClick={onClose} style={{ flexShrink: 0, marginTop: 4 }}>
                        <X size={18} />
                    </button>
                </div>

                <hr className="rule" style={{ marginBottom: 24 }} />

                {/* Full description */}
                {post.description && (
                    <div style={{ marginBottom: 28 }}>
                        <div className="form-label" style={{ marginBottom: 8 }}>About This Pitch</div>
                        <p style={{ fontWeight: 300, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{post.description}</p>
                    </div>
                )}

                {/* AI Summary */}
                {post.ai_summary && (
                    <div className="accent-left-blue" style={{ marginBottom: 28 }}>
                        <div className="form-label" style={{ color: 'var(--blue)', marginBottom: 6 }}>AI Investor Summary</div>
                        <p style={{ margin: 0, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.75 }}>{post.ai_summary}</p>
                    </div>
                )}

                {/* External links row */}
                {(post.deck_url || post.product_url) && (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                        {post.deck_url && (
                            <a href={post.deck_url} target="_blank" rel="noopener noreferrer">
                                <button className="btn-outline" style={{ padding: '10px 22px', fontSize: 'var(--text-xs)', gap: 8 }}>
                                    <BookOpen size={13} /> View Deck
                                </button>
                            </a>
                        )}
                        {post.product_url && (
                            <a href={post.product_url} target="_blank" rel="noopener noreferrer">
                                <button className="btn-primary" style={{ padding: '10px 22px', fontSize: 'var(--text-xs)', gap: 8 }}>
                                    <ExternalLink size={13} /> Product Page
                                </button>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Due Diligence Step ─────────────────────────────────────────── */
function DDStep({ onComplete }) {
    const [notes, setNotes] = useState('');
    return (
        <div className="animate-fade-up">
            <div className="accent-left" style={{ marginBottom: 24 }}>
                <div className="form-label" style={{ color: 'var(--red)', marginBottom: 4 }}>Due Diligence Required</div>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
                    Investments over $10,000 require an investment thesis for our review team.
                </p>
            </div>
            <div className="form-group">
                <label className="form-label">Investment Thesis / Notes</label>
                <textarea placeholder="Rationale, background, conditions…" value={notes} onChange={e => setNotes(e.target.value)} rows={5} />
            </div>
            <button className="btn-red w-full" style={{ padding: 14, fontSize: 'var(--text-xs)' }} onClick={() => onComplete(notes)} disabled={!notes.trim()}>
                Submit for Review →
            </button>
        </div>
    );
}

/* ─── Invest Modal ───────────────────────────────────────────────── */
function InvestModal({ post, user, onClose }) {
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState('amount'); // amount | dd | success
    const [loading, setLoading] = useState(false);
    const BIG = Number(amount) > 10000;
    const cfg = TYPE_CFG[post.type] || TYPE_CFG.idea;

    const { getAuthHeaders } = useAuth();
    const submit = useCallback(async (ddNotes) => {
        setLoading(true);
        try {
            const r = await fetch(`${API}/investments/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ post_id: post.id, amount: Number(amount) }),
            });
            if (!r.ok) throw new Error(await r.text());
            if (ddNotes) {
                const inv = await r.json();
                await fetch(`${API}/investments/due-diligence`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ investment_id: inv.id, notes: ddNotes }),
                });
            }
            setStep('success');
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }, [post.id, amount, getAuthHeaders]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(10,10,10,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.2s ease forwards',
        }}>
            <div style={{
                background: 'var(--white)',
                maxWidth: 440, width: '100%',
                padding: '36px 36px 32px',
                borderTop: '3px solid var(--black)',
                animation: 'fadeUp 0.3s ease forwards',
                position: 'relative',
            }}>
                <button onClick={onClose} className="btn-ghost" style={{ position: 'absolute', top: 16, right: 16 }}><X size={16} /></button>

                {step === 'amount' && (
                    <>
                        <span className={`tag ${cfg.tag}`} style={{ marginBottom: 12, display: 'inline-block' }}>{cfg.label}</span>
                        <h3 style={{ marginBottom: 4 }}>{post.type === 'request' ? 'Commit to Build' : 'Initiate Investment'}</h3>
                        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 24 }}>{post.title}</p>
                        <form onSubmit={e => { e.preventDefault(); if (BIG) setStep('dd'); else submit(null); }}>
                            <div className="form-group">
                                <label className="form-label">{post.type === 'request' ? 'Commitment Estimate (USD)' : 'Investment Amount (USD)'}</label>
                                <input type="number" placeholder="0" min="1" required value={amount} onChange={e => setAmount(e.target.value)} />
                                {BIG && <p className="text-xs text-red" style={{ marginTop: 6 }}>→ Amounts over $10,000 require a Due Diligence step.</p>}
                            </div>
                            <button type="submit" disabled={loading || !amount} className="btn-primary w-full" style={{ padding: 14, fontSize: 'var(--text-xs)' }}>
                                {loading ? <span className="spinner" /> : BIG ? 'Continue → Due Diligence' : 'Confirm'}
                            </button>
                        </form>
                    </>
                )}

                {step === 'dd' && (
                    <>
                        <h3 style={{ marginBottom: 4 }}>Due Diligence</h3>
                        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 20 }}>${Number(amount).toLocaleString()} in "{post.title}"</p>
                        <DDStep onComplete={notes => submit(notes)} />
                    </>
                )}

                {step === 'success' && (
                    <div style={{ textAlign: 'center', padding: '12px 0' }} className="animate-fade-up">
                        <div style={{ width: 48, height: 48, background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                            <Check size={22} color="white" strokeWidth={2.5} />
                        </div>
                        <h3 style={{ marginBottom: 8 }}>
                            {BIG ? 'Review Submitted' : post.type === 'request' ? 'Commitment Logged' : 'Investment Registered'}
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 20 }}>
                            {BIG ? 'Due diligence notes received. Team will follow up.' : 'Support recorded successfully.'}
                        </p>
                        <button className="btn-outline" onClick={onClose}>Close</button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Swipe Hint Overlay ─────────────────────────────────────────── */
function SwipeHint({ direction }) {
    if (!direction) return null;
    const isRight = direction === 'right';
    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 50,
            background: isRight
                ? 'rgba(227, 6, 19, 0.15)'
                : 'rgba(0, 0, 0, 0.12)',
            display: 'flex', alignItems: 'center',
            justifyContent: isRight ? 'flex-end' : 'flex-start',
            padding: '0 48px',
            pointerEvents: 'none',
            animation: 'fadeIn 0.1s ease forwards',
        }}>
            <div style={{
                fontFamily: 'var(--font)', fontWeight: 900,
                fontSize: 'var(--text-xl)', letterSpacing: '-0.03em',
                color: isRight ? 'var(--red)' : 'var(--black)',
                textTransform: 'uppercase',
                opacity: 0.85,
            }}>
                {isRight ? 'Invest →' : '← Chip In'}
            </div>
        </div>
    );
}

/* ─── Single Feed Card ───────────────────────────────────────────── */
function FeedCard({ item, active, onInvest, onBoost, cardIndex }) {
    const [swipeDir, setSwipeDir] = useState(null); // null | 'left' | 'right'
    const [dragX, setDragX] = useState(0);
    const [showDrawer, setShowDrawer] = useState(false);
    const pointerStartX = useRef(null);
    const pointerStartY = useRef(null);
    const isDragging = useRef(false);
    const cfg = TYPE_CFG[item.type] || TYPE_CFG.idea;
    const hasVideo = !!(item.video_url);
    const hasLinks = !!(item.deck_url || item.product_url);

    /* Pointer event handlers — works for touch and mouse */
    const onPointerDown = (e) => {
        // Ignore if clicking a button or interactive element
        if (e.target.closest('button, a, iframe, video, input')) return;
        pointerStartX.current = e.clientX;
        pointerStartY.current = e.clientY;
        isDragging.current = false;
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (pointerStartX.current === null) return;
        const dx = e.clientX - pointerStartX.current;
        const dy = e.clientY - pointerStartY.current;

        // Only activate horizontal swipe if movement is more horizontal than vertical
        if (!isDragging.current && Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        if (!isDragging.current) {
            if (Math.abs(dx) < Math.abs(dy)) {
                // Vertical scroll — cancel
                pointerStartX.current = null;
                return;
            }
            isDragging.current = true;
        }

        setDragX(dx);
        if (Math.abs(dx) >= SWIPE_THRESHOLD) {
            setSwipeDir(dx > 0 ? 'right' : 'left');
        } else {
            setSwipeDir(null);
        }
    };

    const onPointerUp = () => {
        if (pointerStartX.current === null) return;
        if (isDragging.current && Math.abs(dragX) >= SWIPE_THRESHOLD) {
            if (dragX > 0) {
                // Swipe right → Invest
                onInvest(item);
            } else {
                // Swipe left → Chip In (boost)
                onBoost(item);
            }
        }
        pointerStartX.current = null;
        isDragging.current = false;
        setDragX(0);
        setSwipeDir(null);
    };

    return (
        <>
            <div
                className="feed-item"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{
                    position: 'relative',
                    background: hasVideo ? 'var(--black)' : 'var(--white)',
                    userSelect: 'none',
                    touchAction: 'pan-y', // allow vertical scroll, intercept horizontal
                    cursor: isDragging.current ? 'grabbing' : 'default',
                    transform: `translateX(${dragX * 0.08}px)`, // subtle card shift feedback
                    transition: isDragging.current ? 'none' : 'transform 0.2s ease',
                }}
            >
                {/* ── Video Timer progress bar ── */}
                <VideoTimer active={active} hasVideo={hasVideo} cardIndex={cardIndex} />

                {/* ── Video Layer ── */}
                {hasVideo && <VideoPlayer url={item.video_url} active={active} />}

                {/* ── Dark scrim over video so text is legible ── */}
                {hasVideo && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 1,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                        pointerEvents: 'none',
                    }} />
                )}

                {/* ── Swipe feedback overlay ── */}
                <SwipeHint direction={swipeDir} />

                {/* ── Content Layer ── */}
                <div style={{
                    position: 'relative', zIndex: 10,
                    maxWidth: 640,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                    /* With video: content pinned to bottom-left; without: flush left center */
                    alignSelf: hasVideo ? 'flex-end' : 'center',
                    paddingBottom: hasVideo ? 40 : 0,
                    color: hasVideo ? 'var(--white)' : 'inherit',
                }}>
                    {/* Type tag */}
                    <div style={{ marginBottom: 12 }}>
                        <span className={`tag ${cfg.tag}`}>{cfg.label}</span>
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        lineHeight: 1.05,
                        marginBottom: 12,
                        color: hasVideo ? 'var(--white)' : 'var(--black)',
                    }}>
                        {item.title}
                    </h1>

                    {/* AI Summary — only show on non-video cards */}
                    {!hasVideo && item.ai_summary && (
                        <div className="accent-left-blue" style={{ marginBottom: 16 }}>
                            <div className="form-label" style={{ color: 'var(--blue)', marginBottom: 4 }}>AI Summary</div>
                            <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.7, fontStyle: 'italic' }}>
                                {item.ai_summary}
                            </p>
                        </div>
                    )}

                    {/* Description — truncated on text cards */}
                    {!hasVideo && (
                        <p style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: 300,
                            lineHeight: 1.75,
                            marginBottom: 20,
                            maxWidth: '58ch',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}>
                            {item.description}
                        </p>
                    )}

                    {/* ── Action bar ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: hasVideo ? 16 : 0 }}>
                        {/* Info / More — opens drawer */}
                        <button
                            onClick={() => setShowDrawer(true)}
                            style={{
                                padding: '8px 16px',
                                background: hasVideo ? 'rgba(255,255,255,0.12)' : 'transparent',
                                border: `1.5px solid ${hasVideo ? 'rgba(255,255,255,0.3)' : 'var(--gray-200)'}`,
                                color: hasVideo ? 'var(--white)' : 'var(--gray-600)',
                                borderRadius: 0,
                                fontSize: 'var(--text-xs)',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                display: 'flex', alignItems: 'center', gap: 6,
                                cursor: 'pointer',
                                transition: 'all var(--ease)',
                            }}
                        >
                            <Info size={12} /> Info
                        </button>

                        {hasLinks && (
                            <>
                                {item.deck_url && (
                                    <a href={item.deck_url} target="_blank" rel="noopener noreferrer">
                                        <button style={{
                                            padding: '8px 16px',
                                            background: hasVideo ? 'rgba(255,255,255,0.12)' : 'transparent',
                                            border: `1.5px solid ${hasVideo ? 'rgba(255,255,255,0.3)' : 'var(--gray-200)'}`,
                                            color: hasVideo ? 'var(--white)' : 'var(--gray-600)',
                                            borderRadius: 0,
                                            fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                                        }}>
                                            <BookOpen size={12} /> Deck
                                        </button>
                                    </a>
                                )}
                                {item.product_url && (
                                    <a href={item.product_url} target="_blank" rel="noopener noreferrer">
                                        <button style={{
                                            padding: '8px 16px',
                                            background: hasVideo ? 'rgba(255,255,255,0.12)' : 'transparent',
                                            border: `1.5px solid ${hasVideo ? 'rgba(255,255,255,0.3)' : 'var(--gray-200)'}`,
                                            color: hasVideo ? 'var(--white)' : 'var(--gray-600)',
                                            borderRadius: 0,
                                            fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                                        }}>
                                            <ExternalLink size={12} /> Product
                                        </button>
                                    </a>
                                )}
                            </>
                        )}

                        {/* Swipe hint label — right side */}
                        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                            <span style={{ fontSize: 'var(--text-xs)', color: hasVideo ? 'rgba(255,255,255,0.4)' : 'var(--gray-400)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                ← Chip In &nbsp;|&nbsp; Invest →
                            </span>
                            <span style={{ fontSize: 10, color: hasVideo ? 'rgba(255,255,255,0.3)' : 'var(--gray-400)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                swipe to act
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Boost count badge (top right) ── */}
                <div style={{
                    position: 'absolute', top: 24, right: 32, zIndex: 20,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                    <div style={{
                        width: 40, height: 40,
                        background: hasVideo ? 'rgba(255,255,255,0.12)' : 'var(--gray-100)',
                        border: `1.5px solid ${hasVideo ? 'rgba(255,255,255,0.2)' : 'var(--gray-200)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ArrowUp size={16} color={hasVideo ? 'white' : 'var(--black)'} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: hasVideo ? 'white' : 'var(--black)' }}>
                        {item.boost_count || 0}
                    </span>
                </div>

                {/* ── Scroll nav (right side) ── */}
                <div style={{
                    position: 'absolute', right: 32, bottom: 80, zIndex: 20,
                    display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                    <div style={{ color: hasVideo ? 'rgba(255,255,255,0.4)' : 'var(--gray-400)' }}>
                        <ChevronUp size={18} />
                    </div>
                    <div style={{ color: hasVideo ? 'rgba(255,255,255,0.4)' : 'var(--gray-400)' }}>
                        <ChevronDown size={18} />
                    </div>
                </div>
            </div>

            {/* ── Detail drawer ── */}
            {showDrawer && <PostDrawer post={item} onClose={() => setShowDrawer(false)} />}
        </>
    );
}

/* ─── Main Feed ──────────────────────────────────────────────────── */
export default function Feed() {
    const { user, getAuthHeaders } = useAuth();
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [cursor, setCursor] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [activePost, setActivePost] = useState(null); // for invest modal
    const sentinelRef = useRef(null);
    const containerRef = useRef(null);

    /* Detect which card is in view via IntersectionObserver */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const cards = container.querySelectorAll('[data-feed-card]');
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const idx = Number(entry.target.getAttribute('data-feed-card'));
                        setActiveIndex(idx);
                    }
                });
            },
            { root: container, threshold: 0.6 }
        );
        cards.forEach(card => obs.observe(card));
        return () => obs.disconnect();
    }, [items]);

    const loadPage = useCallback(async (cur) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/feed/?cursor=${cur}`);
            if (!res.ok) throw new Error('Failed to load feed.');
            const data = await res.json();
            setItems(prev => cur === 0 ? data.items : [...prev, ...data.items]);
            setCursor(data.next_cursor ?? cur);
            setHasMore(data.next_cursor !== null && data.next_cursor !== undefined);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadPage(0); }, [loadPage]);

    /* Infinite scroll sentinel */
    useEffect(() => {
        const obs = new IntersectionObserver(
            (e) => { if (e[0].isIntersecting && hasMore && !loading) loadPage(cursor); },
            { threshold: 0.1 }
        );
        if (sentinelRef.current) obs.observe(sentinelRef.current);
        return () => obs.disconnect();
    }, [loadPage, hasMore, loading, cursor]);

    const handleInvest = (item) => {
        if (!user) { navigate('/auth'); return; }
        setActivePost(item);
    };

    const handleBoost = async (item) => {
        if (!user) return; // can't boost without auth
        setItems(prev => prev.map(p => p.id === item.id ? { ...p, boost_count: (p.boost_count || 0) + 1 } : p));
        await fetch(`${API}/posts/${item.id}/boost`, { method: 'PATCH', headers: getAuthHeaders() });
    };

    /* Auto-advance on feed:advance event from VideoTimer */
    useEffect(() => {
        const handler = (e) => {
            const nextIdx = e.detail.from + 1;
            const container = containerRef.current;
            if (!container) return;
            const nextCard = container.querySelector(`[data-feed-card="${nextIdx}"]`);
            if (nextCard) nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        window.addEventListener('feed:advance', handler);
        return () => window.removeEventListener('feed:advance', handler);
    }, []);

    if (error) return (
        <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="accent-left"><p className="text-red fw-700">{error}</p></div>
        </div>
    );

    if (!loading && items.length === 0) return (
        <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', gap: 20 }}>
            <h2>No ideas yet.</h2>
            <p>Be the first to pitch something.</p>
            <button className="btn-red" style={{ padding: '12px 28px', fontSize: 'var(--text-xs)' }} onClick={() => navigate('/submit')}>Submit Now →</button>
        </div>
    );

    return (
        <>
            <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>

            <div
                ref={containerRef}
                className="feed-container"
                style={{ paddingTop: 64 }}
            >
                {items.map((item, idx) => (
                    <div key={item.id} data-feed-card={idx}>
                        <FeedCard
                            item={item}
                            active={idx === activeIndex}
                            onInvest={handleInvest}
                            onBoost={handleBoost}
                            cardIndex={idx}
                        />
                    </div>
                ))}

                {loading && (
                    <div className="feed-item" style={{ background: 'var(--white)' }}>
                        <div style={{ maxWidth: 640, width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {[60, 160, 80, 50].map((h, i) => (
                                <div key={i} style={{ height: h, background: 'var(--gray-100)', animation: `shimmer 1.4s ease ${i * 0.1}s infinite` }} />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={sentinelRef} style={{ height: 1 }} />

                {!hasMore && items.length > 0 && (
                    <div style={{ height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid var(--gray-200)' }}>
                        <span className="label text-muted">End of feed</span>
                    </div>
                )}
            </div>

            {activePost && (
                <InvestModal post={activePost} user={user} onClose={() => setActivePost(null)} />
            )}
        </>
    );
}
