'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Calendar, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight, Star } from 'lucide-react';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState(null);

    const handleLogout = async () => {
        if (!confirm('Are you sure you want to switch accounts?')) return;
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.reload();
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    useEffect(() => {
        // Check for 'code' in URL params (OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            handleAuthCallback(code);
        }
    }, []);

    const handleAuthCallback = async (code) => {
        setLoading(true);
        setStatus('Finalizing authentication...');
        try {
            const response = await fetch(`/api/auth/callback?code=${code}`);
            if (!response.ok) throw new Error('Failed to exchange code');

            // Clean up URL
            window.history.replaceState({}, document.title, "/");
            setStatus({ type: 'success', message: 'Authentication successful!' });
            fetchStarredEmails();
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Auth failed: ' + err.message });
        } finally {
            setLoading(false);
        }
    };

    const fetchStarredEmails = async () => {
        setLoading(true);
        setStatus('Scanning Gmail...');
        try {
            const response = await fetch('/api/emails');
            const data = await response.json();

            if (data.error === 'NOT_AUTHENTICATED') {
                setStatus({ type: 'auth', message: 'Authentication required to access Gmail.' });
                return;
            }

            if (data.error) throw new Error(data.error);
            setMessages(data.emails || []);
            setStatus(null);
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    const scheduleEvent = async (emailId) => {
        setLoading(true);
        setStatus('Extracting details & scheduling...');
        try {
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailId }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setStatus({ type: 'success', message: 'Event scheduled successfully!' });
            // Remove the scheduled message from the list
            setMessages(messages.filter(m => m.id !== emailId));
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <nav className="navbar animate-fade-in">
                <div className="logo">MailAgent AI</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: '0.8rem' }}>
                        Switch Account
                    </button>
                    <button className="btn btn-secondary" onClick={() => window.location.reload()} style={{ fontSize: '0.8rem' }}>
                        Refresh
                    </button>
                </div>
            </nav>

            <main>
                <div className="hero animate-fade-in">
                    <h1>Smart Placement <span style={{ color: 'var(--primary)' }}>Scheduler</span></h1>
                    <p>We analyze your starred emails to find interview invites and placement drives, then automatically add them to your Google Calendar.</p>

                    <div style={{ marginTop: '2rem' }}>
                        <button className="btn" onClick={fetchStarredEmails} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                            {loading ? 'Processing...' : 'Scan Starred Emails'}
                        </button>
                    </div>
                </div>

                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`glass-panel`}
                        style={{
                            marginBottom: '2rem',
                            border: status.type === 'error' ? '1px solid #f87171' : (status.type === 'auth' ? '1px solid var(--primary)' : '1px solid #34d399'),
                            padding: '1.5rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {status.type === 'error' ? <AlertCircle color="#f87171" /> : (status.type === 'auth' ? <Sparkles color="var(--primary)" /> : <CheckCircle2 color="#34d399" />)}
                                <span>{typeof status === 'string' ? status : status.message}</span>
                            </div>
                            {status.type === 'auth' && (
                                <button className="btn" onClick={() => window.location.href = '/api/auth'}>
                                    Authenticate with Google
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                <div className="grid">
                    <AnimatePresence>
                        {messages.map((email, index) => (
                            <motion.div
                                key={email.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className="card"
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <Star fill="#fbbf24" color="#fbbf24" size={20} />
                                    <span className="status-badge status-upcoming">New invite</span>
                                </div>
                                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{email.subject}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem', height: '4.5rem', overflow: 'hidden' }}>
                                    {email.body.substring(0, 100)}...
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        From: {email.from.split('<')[0]}
                                    </div>
                                    <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => scheduleEvent(email.id)}>
                                        Schedule <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {messages.length === 0 && !loading && !status && (
                    <div style={{ textAlign: 'center', color: '#475569', marginTop: '4rem' }}>
                        <Mail size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                        <p>No starred emails found. Star an interview invite to get started.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
