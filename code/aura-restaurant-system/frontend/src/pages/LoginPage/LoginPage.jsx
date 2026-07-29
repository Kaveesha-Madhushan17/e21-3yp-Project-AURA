/**
 * ============================================================
 *  AURA Restaurant System — Login Page
 * ============================================================
 *  This is the entry point for ALL users (table staff, admin,
 *  kitchen). A staff member initialises the tablet then hands
 *  it to customers — the customer never sees the nav bar again.
 *
 *  Mock Credentials (remove after backend integration):
 *    table1 / table_pwd_1  →  Robot UI locked to Table 1
 *    table2 / table_pwd_2  →  Robot UI locked to Table 2
 *    admin  / admin123     →  Admin Dashboard
 *    kitchen/ kitchen123   →  Kitchen Display
 *
 * [BACKEND INTEGRATION: TODO] - POST /api/auth/login
 *   Replace the mock login() call with a real API request.
 *   Expected payload:  { username: string, password: string }
 *   Expected response: { token: string, user: { role, tableNumber, displayName } }
 *   Store JWT in localStorage under key 'aura_token'.
 *   On 401 → display the error message from the response body.
 *
 *  ⚠️  ALL auth logic is IDENTICAL to the original.
 *      Only the visual layer has been updated.
 * ============================================================
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence }      from 'framer-motion';
import {
    Zap, User, Lock, Eye, EyeOff, Bot,
    ChevronRight, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import gsap              from 'gsap';
import auraLogo          from '../../assets/aura_logo.png';

export default function LoginPage() {
    /* ── Auth context (unchanged) ── */
    const { login, loginError, startNewCustomer, session } = useAppContext();

    /* ── Form state (unchanged) ── */
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [shakeKey, setShakeKey] = useState(0);

    /* ── Custom cursor refs ── */
    const cursorArrowRef = useRef(null);
    const cursorRingRef  = useRef(null);

    /* ── Cursor: none on body ── */
    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        document.body.style.cursor = 'none';
        return () => { document.body.style.cursor = ''; };
    }, []);

    /* ── GSAP neon-blue arrow cursor (identical to LandingPage) ── */
    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const arrow = cursorArrowRef.current;
        const ring  = cursorRingRef.current;
        if (!arrow || !ring) return;

        const RING_W = 38;
        const HALF_R = RING_W / 2;
        const data   = { x: -200, y: -200, rx: -200, ry: -200 };
        const setAX  = gsap.quickSetter(arrow, 'x', 'px');
        const setAY  = gsap.quickSetter(arrow, 'y', 'px');
        const setRX  = gsap.quickSetter(ring,  'x', 'px');
        const setRY  = gsap.quickSetter(ring,  'y', 'px');

        gsap.set([arrow, ring], { x: -200, y: -200, opacity: 0 });
        let visible = false;

        const onMove = (e) => {
            data.x = e.clientX; data.y = e.clientY;
            setAX(e.clientX); setAY(e.clientY);
            if (!visible) { visible = true; gsap.to([arrow, ring], { opacity: 1, duration: 0.35 }); }
        };
        const tick = () => {
            data.rx += (data.x - data.rx) * 0.11;
            data.ry += (data.y - data.ry) * 0.11;
            setRX(data.rx - HALF_R); setRY(data.ry - HALF_R);
        };
        const onOver  = (e) => {
            if (e.target.closest('button,a,[data-cursor-hover]')) {
                gsap.to(ring,  { scale: 1.8, borderColor: 'rgba(250,204,21,0.9)', duration: 0.22 });
                gsap.to(arrow, { filter: 'drop-shadow(0 0 8px rgba(250,204,21,1)) drop-shadow(0 0 20px rgba(250,204,21,0.6))', duration: 0.22 });
            }
        };
        const onOut   = (e) => {
            if (e.target.closest('button,a,[data-cursor-hover]')) {
                gsap.to(ring,  { scale: 1, borderColor: 'rgba(0,200,255,0.55)', duration: 0.28 });
                gsap.to(arrow, { filter: 'drop-shadow(0 0 5px rgba(0,200,255,1)) drop-shadow(0 0 14px rgba(0,200,255,0.7)) drop-shadow(0 0 28px rgba(0,200,255,0.35))', duration: 0.28 });
            }
        };
        const onDown  = () => gsap.to(arrow, { scale: 0.8, transformOrigin: '0% 0%', duration: 0.1, ease: 'power2.in' });
        const onUp    = () => gsap.to(arrow, { scale: 1,   transformOrigin: '0% 0%', duration: 0.4, ease: 'elastic.out(1,0.45)' });
        const onLeave = () => { visible = false; gsap.to([arrow, ring], { opacity: 0, duration: 0.3 }); };
        const onEnter = () => { if (visible) gsap.to([arrow, ring], { opacity: 1, duration: 0.3 }); };

        gsap.ticker.add(tick);
        document.addEventListener('mousemove',  onMove);
        document.addEventListener('mouseover',  onOver);
        document.addEventListener('mouseout',   onOut);
        document.addEventListener('mousedown',  onDown);
        document.addEventListener('mouseup',    onUp);
        document.addEventListener('mouseleave', onLeave);
        document.addEventListener('mouseenter', onEnter);

        return () => {
            gsap.ticker.remove(tick);
            document.removeEventListener('mousemove',  onMove);
            document.removeEventListener('mouseover',  onOver);
            document.removeEventListener('mouseout',   onOut);
            document.removeEventListener('mousedown',  onDown);
            document.removeEventListener('mouseup',    onUp);
            document.removeEventListener('mouseleave', onLeave);
            document.removeEventListener('mouseenter', onEnter);
        };
    }, []);

    /* ── Submit (unchanged logic) ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) return;
        setLoading(true);
        const ok = await login(username, password);
        setLoading(false);
        if (!ok) setShakeKey((k) => k + 1);
    };

    /* ── Dev quick-fill (unchanged) ── */
    const quickFill = (user, pass) => { setUsername(user); setPassword(pass); };

    /* ══════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* ── Neon-blue arrow cursor ── */}
            <svg
                ref={cursorArrowRef}
                className="cursor-arrow-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 18 24" width="18" height="24"
                aria-hidden="true" focusable="false"
            >
                <defs>
                    <linearGradient id="ag-login" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#00f5ff" />
                        <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                </defs>
                <path
                    d="M 0 0 L 0 18 L 5 13 L 8.5 21.5 L 12 20 L 8.5 12 L 16 12 Z"
                    fill="url(#ag-login)"
                    stroke="rgba(0,200,255,0.25)" strokeWidth="0.6" strokeLinejoin="round"
                />
            </svg>
            <div ref={cursorRingRef} className="cursor-ring-follow" />

            {/* ── Ambient background blobs ── */}
            <div className="absolute inset-0 bg-grid opacity-12 pointer-events-none" />
            <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-neon-blue/10 blur-[140px] rounded-full pointer-events-none animate-pulse-soft" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-neon-cyan/7 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/3 blur-[160px] rounded-full pointer-events-none" />

            {/* ── Animated top scan line ── */}
            <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(0,245,255,0.5),transparent)' }} />

            <div className="w-full max-w-md relative z-10">

                {/* ── Logo / brand area ── */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-8"
                >
                    {/* Logo orb with pulse rings */}
                    <div className="relative inline-flex items-center justify-center mb-5">
                        <div className="absolute w-28 h-28 rounded-full border border-neon-cyan/15 animate-[spin_12s_linear_infinite]" />
                        <div className="absolute w-20 h-20 rounded-full border border-neon-cyan/10 animate-[spin_8s_linear_infinite_reverse]" />
                        <div className="absolute w-36 h-36 rounded-full bg-neon-cyan/5 blur-xl animate-pulse-soft" />
                        <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(0,245,255,0.22)]"
                            style={{ background: 'linear-gradient(135deg,rgba(0,245,255,0.15),rgba(76,110,245,0.2))' }}>
                            <div className="absolute inset-0 rounded-3xl border border-neon-cyan/25" />
                            <img src={auraLogo} alt="AURA"
                                className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(0,245,255,0.7)] animate-float" />
                        </div>
                    </div>

                    <h1 className="font-display text-4xl font-black text-white tracking-tight">
                        AUR<span className="text-neon-cyan">A</span>
                    </h1>
                    <p className="text-dark-400 mt-1.5 text-xs tracking-[0.22em] uppercase font-semibold">
                        Smart Restaurant System
                    </p>
                </motion.div>

                {/* ── Login card ── */}
                <motion.div
                    key={shakeKey}
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{
                        opacity: 1, y: 0, scale: 1,
                        x: shakeKey > 0
                            ? [0, -10, 10, -8, 8, -4, 4, 0]
                            : 0,
                    }}
                    transition={{
                        duration: shakeKey > 0 ? 0.45 : 0.6,
                        ease: shakeKey > 0 ? 'easeInOut' : [0.22, 1, 0.36, 1],
                    }}
                    className="glass rounded-3xl overflow-hidden border border-white/7 shadow-[0_32px_80px_rgba(0,0,0,0.55)]"
                >
                    {/* Top gradient stripe */}
                    <div className="h-1" style={{ background: 'linear-gradient(90deg,#00f5ff,#4c6ef5,#facc15)' }} />

                    <div className="p-8">
                        {/* Card header */}
                        <div className="mb-7">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-cyan/8 border border-neon-cyan/20 text-neon-cyan text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                                Staff Access
                            </div>
                            <h2 className="font-display text-2xl font-black text-white mb-1">
                                Sign In
                            </h2>
                            <p className="text-dark-400 text-sm">
                                Enter your credentials to initialise this terminal.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Username */}
                            <div className="space-y-1.5">
                                <label className="aura-label">Username</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" />
                                    <input
                                        id="login-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="e.g. table1, admin, kitchen"
                                        autoComplete="username"
                                        className="aura-input pl-11"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="aura-label">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" />
                                    <input
                                        id="login-password"
                                        type={showPass ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        autoComplete="current-password"
                                        className="aura-input pl-11 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((s) => !s)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-neon-cyan transition-colors duration-200"
                                        aria-label={showPass ? 'Hide password' : 'Show password'}
                                    >
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error message */}
                            <AnimatePresence>
                                {loginError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400"
                                    >
                                        <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                                        <span>{loginError}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading || !username || !password}
                                className="w-full group relative overflow-hidden py-4 rounded-2xl font-bold text-base text-dark-950 flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.015] hover:shadow-[0_0_32px_rgba(0,245,255,0.35)]"
                                style={{ background: 'linear-gradient(135deg,#00f5ff,#4c6ef5)' }}
                            >
                                <span className="absolute inset-0 bg-white/20 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 skew-x-12 pointer-events-none" />
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                                        <span>Signing in…</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap size={18} />
                                        <span>Sign In</span>
                                        <ChevronRight size={16} className="ml-auto opacity-60" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* ── New Customer Button (unchanged logic) ── */}
                        {session && session.role === 'table' && session.tableNumber && (
                            <div className="mt-6 pt-6 border-t border-white/6">
                                <button
                                    id="new-customer-btn"
                                    type="button"
                                    onClick={() => {
                                        if (startNewCustomer(session.tableNumber)) {
                                            window.location.reload();
                                        }
                                    }}
                                    className="w-full group relative overflow-hidden py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.015] border border-neon-blue/30 hover:border-neon-blue/60 text-neon-blue hover:bg-neon-blue/8"
                                >
                                    <RefreshCw size={15} />
                                    New Customer — Clear Current Order
                                </button>
                                <p className="text-center text-dark-500 text-xs mt-2">
                                    Start fresh for next customer at {session.tableNumber}
                                </p>
                            </div>
                        )}

                        {/* ── Dev Quick-Fill Panel (unchanged — remove in production) ── */}
                        <details className="mt-6">
                            <summary className="text-[11px] text-dark-600 cursor-pointer hover:text-dark-400 transition-colors select-none flex items-center gap-1.5">
                                <Bot size={12} />
                                Dev: Quick fill credentials
                            </summary>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {[
                                    ['table1',  'table_pwd_1'],
                                    ['table2',  'table_pwd_2'],
                                    ['admin',   'admin123'   ],
                                    ['kitchen', 'kitchen123' ],
                                ].map(([u, p]) => (
                                    <button
                                        key={u}
                                        onClick={() => quickFill(u, p)}
                                        className="text-[11px] px-3 py-2 rounded-xl bg-dark-800/60 hover:bg-dark-700/80 border border-white/6 hover:border-neon-cyan/20 text-dark-300 hover:text-white transition-all text-left"
                                    >
                                        <span className="font-mono">{u}</span>
                                    </button>
                                ))}
                            </div>
                        </details>
                    </div>
                </motion.div>

                {/* ── Footer note ── */}
                <p className="text-center text-dark-600 text-xs mt-5 tracking-wide">
                    © {new Date().getFullYear()} Project AURA — for authorised staff use only
                </p>
            </div>
        </div>
    );
}
