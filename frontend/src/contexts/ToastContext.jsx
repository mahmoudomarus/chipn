import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

let _id = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const removeToast = useCallback((id) => {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++_id;
        setToasts(prev => [...prev, { id, message, type }]);
        timers.current[id] = setTimeout(() => removeToast(id), duration);
        return id;
    }, [removeToast]);

    const toast = useCallback({}, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}

            {/* Toast container — bottom-right, stacked */}
            <div style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: 8,
                zIndex: 10000,
                pointerEvents: 'none',
            }}>
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className="animate-fade-up"
                        style={{
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '12px 20px',
                            background: t.type === 'error' ? 'var(--red)' :
                                t.type === 'success' ? 'var(--green)' :
                                    'var(--black)',
                            color: 'var(--white)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 500,
                            letterSpacing: '0.01em',
                            maxWidth: 380,
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }}
                        onClick={() => removeToast(t.id)}
                    >
                        <span style={{ flexShrink: 0 }}>
                            {t.type === 'error' ? '✕' : t.type === 'success' ? '✓' : 'ℹ'}
                        </span>
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
