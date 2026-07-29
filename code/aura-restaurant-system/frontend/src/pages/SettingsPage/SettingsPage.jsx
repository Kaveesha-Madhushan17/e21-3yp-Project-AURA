/**
 * ============================================================
 *  AURA Restaurant System — Admin Settings Page
 * ============================================================
 *  Account info + change password.
 *  ⚠️  ALL backend logic is IDENTICAL to the original.
 *      Only the visual layer has been updated.
 * ============================================================
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, User, Lock, Shield,
    AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Footer  from '../../components/layout/Footer';
import { useAppContext } from '../../context/AppContext';
import { changePassword } from '../../api/settingsAPI';

export default function SettingsPage() {
    /* ── ALL state and logic UNCHANGED ── */
    const { session } = useAppContext();

    const [form, setForm] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    });
    const [error,      setError]      = useState('');
    const [success,    setSuccess]    = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (form.newPassword.length < 8)                     return setError('New password must be at least 8 characters.');
        if (form.newPassword !== form.confirmPassword)        return setError('Passwords do not match.');
        setSubmitting(true);
        try {
            await changePassword(form.currentPassword, form.newPassword);
            setSuccess('Password changed successfully.');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Role badge colour ── */
    const roleColor = (role) => {
        const r = (role || '').toLowerCase();
        if (r === 'admin')   return { text: 'text-gold-400',    bg: 'bg-gold-500/10 border-gold-500/20'     };
        if (r === 'kitchen') return { text: 'text-neon-cyan',   bg: 'bg-neon-cyan/10 border-neon-cyan/20'   };
        return                      { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20'};
    };
    const rs = roleColor(session?.role);

    /* ══════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════ */
    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 bg-dark-950">

                {/* ── Page Header ── */}
                <div className="relative px-6 lg:px-8 pt-8 pb-5">
                    <div className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg,transparent,rgba(0,245,255,0.3),transparent)' }} />
                    <div>
                        <p className="text-neon-cyan text-[10px] font-bold tracking-[0.22em] uppercase mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                            Configuration
                        </p>
                        <h1 className="font-display text-3xl font-black text-white flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                                <Settings size={18} className="text-neon-cyan" />
                            </div>
                            Settings
                        </h1>
                        <p className="text-dark-400 mt-1 text-sm">Account details and security</p>
                    </div>
                </div>

                <div className="flex-1 px-6 lg:px-8 pb-8 space-y-5 max-w-2xl">

                    {/* ── Account Info card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="glass rounded-2xl overflow-hidden border border-white/7"
                    >
                        <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#00f5ff,#4c6ef5,#facc15)' }} />
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                                <User size={13} className="text-neon-cyan" />
                            </div>
                            <h2 className="font-display text-base font-bold text-white">Account Information</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Username row */}
                            <div className="flex items-center justify-between py-3 border-b border-white/4">
                                <div className="flex items-center gap-2 text-sm text-dark-400">
                                    <User size={13} className="text-dark-500" />
                                    Username
                                </div>
                                <span className="text-sm font-bold text-white font-mono">
                                    {session?.username || '—'}
                                </span>
                            </div>
                            {/* Role row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-dark-400">
                                    <Shield size={13} className="text-dark-500" />
                                    Role
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${rs.bg} ${rs.text}`}>
                                    {session?.role || '—'}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Change Password card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="glass rounded-2xl overflow-hidden border border-white/7"
                    >
                        <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#f59e0b,#facc15)' }} />
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                                <Lock size={13} className="text-gold-400" />
                            </div>
                            <h2 className="font-display text-base font-bold text-white">Change Password</h2>
                        </div>

                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">

                            <div>
                                <label className="aura-label mb-1.5 block">Current Password</label>
                                <input
                                    type="password" value={form.currentPassword}
                                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                    className="aura-input"
                                />
                            </div>
                            <div>
                                <label className="aura-label mb-1.5 block">New Password</label>
                                <input
                                    type="password" value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                    placeholder="Min. 8 characters"
                                    className="aura-input"
                                />
                            </div>
                            <div>
                                <label className="aura-label mb-1.5 block">Confirm New Password</label>
                                <input
                                    type="password" value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    className="aura-input"
                                />
                            </div>

                            {/* Feedback */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-3 text-sm text-red-400"
                                    >
                                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                        {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3.5 py-3 text-sm text-emerald-400"
                                    >
                                        <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
                                        {success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full group relative overflow-hidden py-3.5 rounded-xl font-bold text-sm text-dark-950 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_24px_rgba(245,158,11,0.35)] hover:scale-[1.015]"
                                style={{ background: 'linear-gradient(135deg,#f59e0b,#facc15)' }}
                            >
                                <span className="absolute inset-0 bg-white/20 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 skew-x-12 pointer-events-none" />
                                {submitting ? (
                                    <><Loader2 size={15} className="animate-spin" />Updating…</>
                                ) : (
                                    <><Lock size={15} />Change Password</>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>

                <Footer />
            </div>
        </div>
    );
}