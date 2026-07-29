/**
 * ============================================================
 *  AURA Restaurant System — Staff Management Page
 * ============================================================
 *  List existing staff/kitchen/admin accounts and add new ones.
 *  ⚠️  ALL backend logic is IDENTICAL to the original.
 *      Only the visual layer has been updated.
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, RefreshCw, UserCheck,
    AlertCircle, CheckCircle2, Loader2, ChevronDown,
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Footer  from '../../components/layout/Footer';
import { getStaffList, registerStaff } from '../../api/staffAPI';

const ROLES = [
    { value: 'STAFF',   label: 'Staff',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { value: 'KITCHEN', label: 'Kitchen', color: 'text-neon-cyan',   bg: 'bg-neon-cyan/10 border-neon-cyan/20'     },
    { value: 'ADMIN',   label: 'Admin',   color: 'text-gold-400',    bg: 'bg-gold-500/10 border-gold-500/20'       },
];

const roleStyle = (role) => ROLES.find(r => r.value === role) ?? ROLES[0];

export default function StaffPage() {
    /* ── All state and logic UNCHANGED ── */
    const [staff,    setStaff]    = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');

    const [form, setForm] = useState({
        username: '', password: '', firstName: '', lastName: '',
        email: '', phone: '', role: 'STAFF',
    });
    const [formError,   setFormError]   = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [submitting,  setSubmitting]  = useState(false);

    const loadStaff = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getStaffList();
            setStaff(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load staff list.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStaff(); }, []);

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        if (!form.username.trim())                                 return setFormError('Username is required.');
        if (form.password.length < 8)                             return setFormError('Password must be at least 8 characters.');
        if (!form.firstName.trim() || !form.lastName.trim())      return setFormError('First and last name are required.');
        setSubmitting(true);
        try {
            await registerStaff(form);
            setFormSuccess(`"${form.username}" added as ${form.role}.`);
            setForm({ username: '', password: '', firstName: '', lastName: '', email: '', phone: '', role: 'STAFF' });
            await loadStaff();
            setTimeout(() => setFormSuccess(''), 4000);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to add staff member.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Helpers ── */
    const initials = (m) =>
        `${(m.firstName?.[0] ?? '').toUpperCase()}${(m.lastName?.[0] ?? '').toUpperCase()}`;

    /* ══════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════ */
    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 bg-dark-950">

                {/* ── Page Header ── */}
                <div className="relative px-6 lg:px-8 pt-8 pb-5">
                    {/* Subtle top gradient */}
                    <div className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg,transparent,rgba(0,245,255,0.3),transparent)' }} />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-neon-cyan text-[10px] font-bold tracking-[0.22em] uppercase mb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                                Administration
                            </p>
                            <h1 className="font-display text-3xl font-black text-white flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                                    <Users size={18} className="text-neon-cyan" />
                                </div>
                                Staff Management
                            </h1>
                            <p className="text-dark-400 mt-1 text-sm">
                                Manage staff, kitchen, and admin accounts
                            </p>
                        </div>

                        <button
                            onClick={loadStaff}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/6 hover:border-neon-cyan/25 text-dark-300 hover:text-white text-sm transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin text-neon-cyan' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-6 lg:px-8 pb-8 grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ══ Add Staff Form ══ */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="glass rounded-2xl overflow-hidden border border-white/7 sticky top-24"
                        >
                            {/* Card top stripe */}
                            <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#00f5ff,#4c6ef5,#facc15)' }} />

                            <div className="p-6">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                                        <Plus size={15} className="text-neon-cyan" />
                                    </div>
                                    <div>
                                        <h2 className="font-display text-lg font-bold text-white leading-none">Add Staff Member</h2>
                                        <p className="text-dark-500 text-[11px] mt-0.5">Creates a new login account immediately.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleAddStaff} className="space-y-3.5">

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="aura-label mb-1.5 block">First Name *</label>
                                            <input type="text" value={form.firstName}
                                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                                className="aura-input" />
                                        </div>
                                        <div>
                                            <label className="aura-label mb-1.5 block">Last Name *</label>
                                            <input type="text" value={form.lastName}
                                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                                className="aura-input" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="aura-label mb-1.5 block">Username *</label>
                                        <input type="text" value={form.username}
                                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                                            placeholder="e.g. chef_bob"
                                            className="aura-input" />
                                    </div>

                                    <div>
                                        <label className="aura-label mb-1.5 block">Password *</label>
                                        <input type="password" value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            placeholder="Min. 8 characters"
                                            className="aura-input" />
                                    </div>

                                    <div>
                                        <label className="aura-label mb-1.5 block">Email</label>
                                        <input type="email" value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="e.g. bob@aura.com"
                                            className="aura-input" />
                                    </div>

                                    <div>
                                        <label className="aura-label mb-1.5 block">Phone</label>
                                        <input type="text" value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="e.g. 123-456-7890"
                                            className="aura-input" />
                                    </div>

                                    <div>
                                        <label className="aura-label mb-1.5 block">Role</label>
                                        <div className="relative">
                                            <select
                                                value={form.role}
                                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                                className="aura-input appearance-none pr-9"
                                            >
                                                {ROLES.map((r) => (
                                                    <option key={r.value} value={r.value}>{r.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Feedback messages */}
                                    <AnimatePresence>
                                        {formError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-3 text-sm text-red-400"
                                            >
                                                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                                {formError}
                                            </motion.div>
                                        )}
                                        {formSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3.5 py-3 text-sm text-emerald-400"
                                            >
                                                <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
                                                {formSuccess}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full group relative overflow-hidden py-3.5 rounded-xl font-bold text-sm text-dark-950 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_24px_rgba(0,245,255,0.3)] hover:scale-[1.015]"
                                        style={{ background: 'linear-gradient(135deg,#00f5ff,#4c6ef5)' }}
                                    >
                                        <span className="absolute inset-0 bg-white/20 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 skew-x-12 pointer-events-none" />
                                        {submitting ? (
                                            <><Loader2 size={15} className="animate-spin" />Adding…</>
                                        ) : (
                                            <><Plus size={15} />Add Staff Member</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>

                    {/* ══ Staff List ══ */}
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* List header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                                    <UserCheck size={18} className="text-neon-cyan" />
                                    Current Staff
                                </h2>
                                <span className="text-xs text-dark-500 font-mono bg-dark-800/60 border border-white/6 px-2.5 py-1 rounded-full">
                                    {staff.length} account{staff.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Error banner */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400 mb-4"
                                    >
                                        <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Loading skeleton */}
                            {loading && (
                                <div className="space-y-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-16 rounded-xl bg-dark-800/40 border border-white/4 animate-pulse" />
                                    ))}
                                </div>
                            )}

                            {/* Empty state */}
                            {!loading && staff.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-14 glass rounded-2xl border border-white/6">
                                    <Users size={32} className="text-dark-600 mb-3" />
                                    <p className="text-dark-500 text-sm">No staff accounts yet.</p>
                                    <p className="text-dark-600 text-xs mt-1">Use the form on the left to add one.</p>
                                </div>
                            )}

                            {/* Staff cards */}
                            {!loading && staff.length > 0 && (
                                <div className="space-y-2">
                                    {staff.map((member, idx) => {
                                        const rs = roleStyle(member.role);
                                        return (
                                            <motion.div
                                                key={member.id}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.04, duration: 0.35 }}
                                                className="glass-light rounded-xl px-4 py-3 flex items-center gap-4 border border-white/5 hover:border-white/10 transition-all duration-200 group"
                                            >
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-sm font-bold text-neon-cyan flex-shrink-0 border border-white/6 group-hover:border-neon-cyan/20 transition-all">
                                                    {initials(member)}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {member.firstName} {member.lastName}
                                                    </p>
                                                    <p className="text-xs text-dark-400 truncate font-mono">
                                                        @{member.username}{member.email ? ` · ${member.email}` : ''}
                                                    </p>
                                                </div>

                                                {/* Role badge */}
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 uppercase tracking-wide ${rs.bg} ${rs.color}`}>
                                                    {member.role}
                                                </span>

                                                {/* Inactive badge */}
                                                {!member.active && (
                                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 flex-shrink-0 uppercase tracking-wide">
                                                        Inactive
                                                    </span>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}