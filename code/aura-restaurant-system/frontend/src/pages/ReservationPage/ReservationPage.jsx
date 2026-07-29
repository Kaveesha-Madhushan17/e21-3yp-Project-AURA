/**
 * ============================================================
 *  ReservationPage.jsx — AURA Restaurant System
 *  UI/UX revamp (dark glassmorphism, GSAP-quality motion)
 * ============================================================
 *  ⚠️  ALL backend logic, API calls, state, validation, and
 *      error handling are IDENTICAL to the original file.
 *      Only the visual/layout layer has been updated.
 * ============================================================
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon, Clock, Users,
    ArrowLeft, CheckCircle2, AlertCircle,
    Mail, Phone, Utensils, ChevronRight,
} from 'lucide-react';
import { reservationAPI } from '../../api/reservationAPI';
import auraLogo from '../../assets/aura_logo.png';
import gsap     from 'gsap';

export default function ReservationPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: form, 2: success

    /* ── Date helpers (unchanged) ── */
    const today = new Date();
    const minReservationDate = today.toISOString().split('T')[0];
    const maxReservationDate = (() => {
        const future = new Date(today);
        future.setMonth(future.getMonth() + 1);
        return future.toISOString().split('T')[0];
    })();

    const TABLE_COUNT          = 10;
    const BOOKING_DURATION_HOURS = 2;

    /* ── Form state (unchanged) ── */
    const [formData, setFormData] = useState({
        customerName:    '',
        customerEmail:   '',
        customerPhone:   '',
        partySize:       2,
        tableNumber:     '1',
        reservationDate: minReservationDate,
        timeSlot:        '',
    });

    /* ── Slot / submission state (unchanged) ── */
    const [slots,        setSlots]        = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error,        setError]        = useState(null);
    const [fieldErrors,  setFieldErrors]  = useState({});
    const [confirmedData,setConfirmedData]= useState(null);

    /* ── Formatters (unchanged) ── */
    const formatSlotLabel = (slotTime) => {
        const [hour, minute] = slotTime.split(':').map(Number);
        const start = new Date();
        start.setHours(hour, minute, 0, 0);
        const end = new Date(start);
        end.setHours(end.getHours() + BOOKING_DURATION_HOURS);
        return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const formatReservationDate = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatReservationTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    /* ── Custom cursor refs ── */
    const cursorArrowRef = useRef(null);
    const cursorRingRef  = useRef(null);

    /* ── Cursor: none on body while this page is mounted ── */
    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        document.body.style.cursor = 'none';
        return () => { document.body.style.cursor = ''; };
    }, []);

    /* ── GSAP neon-blue arrow cursor tracking ── */
    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const arrow = cursorArrowRef.current;
        const ring  = cursorRingRef.current;
        if (!arrow || !ring) return;

        const RING_W = 38;
        const HALF_R = RING_W / 2;
        const data   = { x: -200, y: -200, rx: -200, ry: -200 };

        const setAX = gsap.quickSetter(arrow, 'x', 'px');
        const setAY = gsap.quickSetter(arrow, 'y', 'px');
        const setRX = gsap.quickSetter(ring,  'x', 'px');
        const setRY = gsap.quickSetter(ring,  'y', 'px');

        gsap.set([arrow, ring], { x: -200, y: -200, opacity: 0 });
        let visible = false;

        const onMove = (e) => {
            data.x = e.clientX;
            data.y = e.clientY;
            setAX(e.clientX);
            setAY(e.clientY);
            if (!visible) {
                visible = true;
                gsap.to([arrow, ring], { opacity: 1, duration: 0.35 });
            }
        };

        const tick = () => {
            data.rx += (data.x - data.rx) * 0.11;
            data.ry += (data.y - data.ry) * 0.11;
            setRX(data.rx - HALF_R);
            setRY(data.ry - HALF_R);
        };

        const onOver = (e) => {
            if (e.target.closest('button, a, [data-cursor-hover]')) {
                gsap.to(ring,  { scale: 1.8, borderColor: 'rgba(250,204,21,0.9)', duration: 0.22 });
                gsap.to(arrow, { filter: 'drop-shadow(0 0 8px rgba(250,204,21,1)) drop-shadow(0 0 20px rgba(250,204,21,0.6))', duration: 0.22 });
            }
        };
        const onOut = (e) => {
            if (e.target.closest('button, a, [data-cursor-hover]')) {
                gsap.to(ring,  { scale: 1, borderColor: 'rgba(0,200,255,0.55)', duration: 0.28 });
                gsap.to(arrow, { filter: 'drop-shadow(0 0 5px rgba(0,200,255,1)) drop-shadow(0 0 14px rgba(0,200,255,0.7)) drop-shadow(0 0 28px rgba(0,200,255,0.35))', duration: 0.28 });
            }
        };

        const onDown = () => gsap.to(arrow, { scale: 0.8, transformOrigin: '0% 0%', duration: 0.1, ease: 'power2.in' });
        const onUp   = () => gsap.to(arrow, { scale: 1,   transformOrigin: '0% 0%', duration: 0.4, ease: 'elastic.out(1,0.45)' });
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

    /* ── Fetch slots (unchanged) ── */
    useEffect(() => {
        const fetchSlots = async () => {
            setLoadingSlots(true);
            setError(null);
            try {
                const response = await reservationAPI.getAvailableSlots(
                    formData.reservationDate,
                    Number(formData.partySize),
                    formData.tableNumber
                );
                setSlots(response.slots || []);
                setFormData(prev => ({ ...prev, timeSlot: '' }));
            } catch {
                setError('Could not load available times. Please try again.');
            } finally {
                setLoadingSlots(false);
            }
        };
        if (formData.reservationDate) fetchSlots();
    }, [formData.reservationDate, formData.partySize, formData.tableNumber]);

    /* ── Input change (unchanged) ── */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => { const c = { ...prev }; delete c[name]; return c; });
    };

    /* ── Build reservation time (unchanged) ── */
    const buildReservationTime = () => {
        if (!formData.reservationDate || !formData.timeSlot) return null;
        const [year, month, day]   = formData.reservationDate.split('-').map(Number);
        const [hour, minute]       = formData.timeSlot.split(':').map(Number);
        const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
        if (Number.isNaN(dt.getTime()) || dt <= new Date()) return null;
        const p = (v) => String(v).padStart(2, '0');
        return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}:00`;
    };

    /* ── Submit (unchanged) ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            setFieldErrors({});
            const reservationTime = buildReservationTime();
            if (!reservationTime) {
                setError('Please select a valid future time slot.');
                setIsSubmitting(false);
                return;
            }
            const payload = {
                customerName: formData.customerName,
                email:        formData.customerEmail,
                phone:        formData.customerPhone,
                partySize:    Number(formData.partySize),
                tableNumber:  Number(formData.tableNumber),
                reservationTime,
            };
            const response = await reservationAPI.createReservation(payload);
            setConfirmedData(response);
            setStep(2);
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Sorry, that time slot was just booked by someone else. Please choose another time.');
                const response = await reservationAPI.getAvailableSlots(
                    formData.reservationDate,
                    Number(formData.partySize)
                );
                setSlots(response.slots || []);
                setFormData(prev => ({ ...prev, timeSlot: '' }));
            } else if (err.response?.status === 400) {
                const fe = err.response?.data?.fields || {};
                const msg = Object.entries(fe).map(([f, m]) => `${f}: ${m}`).join('; ');
                console.error('Reservation validation failed:', fe);
                setFieldErrors(fe);
                setError(msg || err.response?.data?.error || 'An error occurred while booking. Please try again.');
            } else {
                setError(err.response?.data?.error || 'An error occurred while booking. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ══════════════════════════════════════════════════════════
       SUCCESS SCREEN
    ══════════════════════════════════════════════════════════ */
    if (step === 2 && confirmedData) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 relative overflow-hidden">
                {/* ── Neon-blue arrow cursor (same as LandingPage) ── */}
                <svg
                    ref={cursorArrowRef}
                    className="cursor-arrow-svg"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 18 24"
                    width="18" height="24"
                    aria-hidden="true" focusable="false"
                >
                    <defs>
                        <linearGradient id="ag-res" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"   stopColor="#00f5ff" />
                            <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M 0 0 L 0 18 L 5 13 L 8.5 21.5 L 12 20 L 8.5 12 L 16 12 Z"
                        fill="url(#ag-res)"
                        stroke="rgba(0,200,255,0.25)" strokeWidth="0.6" strokeLinejoin="round"
                    />
                </svg>
                <div ref={cursorRingRef} className="cursor-ring-follow" />
                {/* Ambient blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/8 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neon-cyan/6 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.88, opacity: 0, y: 24 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* Card */}
                    <div className="glass rounded-3xl overflow-hidden border border-white/8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
                        {/* Top accent stripe */}
                        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#10b981,#00f5ff,#4c6ef5)' }} />

                        <div className="p-8 text-center">
                            {/* Check icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.25 }}
                                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                                style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.25),rgba(16,185,129,0.05))' }}
                            >
                                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 size={36} className="text-emerald-400" />
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                                <p className="text-emerald-400 text-xs font-bold tracking-[0.22em] uppercase mb-1">Reservation Confirmed</p>
                                <h2 className="text-3xl font-display font-black text-white mb-2">Table Confirmed!</h2>
                                <p className="text-dark-300 text-sm leading-relaxed">
                                    Thank you, <span className="text-white font-semibold">{confirmedData.customerName}</span>.
                                    A confirmation has been sent to{' '}
                                    <span className="text-neon-cyan">{confirmedData.email ?? confirmedData.customerEmail}</span>.
                                </p>
                            </motion.div>

                            {/* Booking details */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                className="mt-7 rounded-2xl border border-white/8 bg-dark-900/60 backdrop-blur-sm p-5 text-left space-y-3.5"
                            >
                                {[
                                    {
                                        Icon: CalendarIcon, color: 'text-gold-400',
                                        text: formatReservationDate(confirmedData.reservationTime),
                                    },
                                    {
                                        Icon: Clock, color: 'text-neon-cyan',
                                        text: `${formatReservationTime(confirmedData.reservationTime)} – ${formatReservationTime(
                                            new Date(new Date(confirmedData.reservationTime).setHours(
                                                new Date(confirmedData.reservationTime).getHours() + BOOKING_DURATION_HOURS
                                            ))
                                        )}`,
                                    },
                                    {
                                        Icon: Users, color: 'text-neon-blue',
                                        text: `${confirmedData.partySize} Guests · Table ${confirmedData.tableNumber}`,
                                    },
                                    {
                                        Icon: Mail, color: 'text-purple-400',
                                        text: `${confirmedData.email ?? confirmedData.customerEmail} · ${confirmedData.phone}`,
                                    },
                                ].map(({ Icon, color, text }, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-dark-100">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center ${color}`}>
                                            <Icon size={15} />
                                        </div>
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Return button */}
                            <motion.button
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 }}
                                onClick={() => navigate('/landing')}
                                className="mt-7 w-full group relative overflow-hidden font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02]"
                                style={{ background: 'linear-gradient(135deg,#00f5ff,#4c6ef5)' }}
                            >
                                <span className="absolute inset-0 bg-white/15 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 skew-x-12" />
                                <span className="text-dark-950">Return to Home</span>
                                <ChevronRight size={18} className="text-dark-950" />
                            </motion.button>
                        </div>
                    </div>

                    {/* AURA branding below card */}
                    <p className="mt-6 text-center text-dark-500 text-xs tracking-wider">
                        AURA Automated Urban Restaurant Assistant
                    </p>
                </motion.div>
            </div>
        );
    }

    /* ══════════════════════════════════════════════════════════
       BOOKING FORM
    ══════════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-dark-950 relative overflow-hidden flex flex-col">

            {/* ── Neon-blue arrow cursor (same as LandingPage) ── */}
            <svg
                ref={cursorArrowRef}
                className="cursor-arrow-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 18 24"
                width="18" height="24"
                aria-hidden="true" focusable="false"
            >
                <defs>
                    <linearGradient id="ag-res" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#00f5ff" />
                        <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                </defs>
                <path
                    d="M 0 0 L 0 18 L 5 13 L 8.5 21.5 L 12 20 L 8.5 12 L 16 12 Z"
                    fill="url(#ag-res)"
                    stroke="rgba(0,200,255,0.25)" strokeWidth="0.6" strokeLinejoin="round"
                />
            </svg>
            <div ref={cursorRingRef} className="cursor-ring-follow" />

            {/* ── Background ambient blobs ── */}
            <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-neon-blue/12 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-500/7 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

            {/* ── Header ── */}
            <header className="px-6 py-5 relative z-10 flex items-center justify-between">
                <button
                    onClick={() => navigate('/landing')}
                    className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors duration-300 group"
                >
                    <div className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center group-hover:border-neon-cyan/40 group-hover:text-neon-cyan transition-all duration-300">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">Back</span>
                </button>

                <div className="flex items-center gap-2.5">
                    <img src={auraLogo} alt="AURA"
                        className="h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,245,255,0.55)]" />
                    <span className="font-display font-bold text-xl tracking-wide hidden sm:block">
                        AUR<span className="text-neon-cyan">A</span>
                    </span>
                </div>

                <div className="w-24" /> {/* Spacer */}
            </header>

            {/* ── Main form card ── */}
            <main className="flex-1 flex items-start md:items-center justify-center px-4 pb-10 pt-2 relative z-10">
                <motion.div
                    initial={{ y: 28, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-5xl"
                >
                    {/* Top accent bar */}
                    <div className="h-px w-full mb-0 rounded-t-3xl overflow-hidden">
                        <div className="h-full" style={{ background: 'linear-gradient(90deg,transparent,#00f5ff,#4c6ef5,#facc15,transparent)' }} />
                    </div>

                    <div className="glass rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.55)] border border-white/7 flex flex-col lg:flex-row">

                        {/* ══ LEFT PANEL — info sidebar ══ */}
                        <div className="w-full lg:w-[300px] flex-shrink-0 relative overflow-hidden">
                            {/* Panel background */}
                            <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" />
                            <div className="absolute inset-0 border-r border-white/5" />
                            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-neon-cyan/20 to-transparent" />

                            <div className="relative z-10 p-8 h-full flex flex-col">
                                {/* Logo micro */}
                                <div className="mb-8">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-cyan/8 border border-neon-cyan/20 text-neon-cyan text-[10px] font-bold tracking-[0.2em] uppercase mb-5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                                        Table Reservation
                                    </div>
                                    <h2 className="text-2xl font-display font-black text-white leading-tight mb-3">
                                        Book a<br />
                                        <span style={{
                                            background: 'linear-gradient(125deg,#facc15,#f59e0b)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}>Table</span>
                                    </h2>
                                    <p className="text-dark-300 text-sm leading-relaxed">
                                        Experience the future of dining. Select your preferred date and time. Reservations are held for {BOOKING_DURATION_HOURS} hours.
                                    </p>
                                </div>

                                {/* Info items */}
                                <div className="space-y-5 flex-1">
                                    {[
                                        {
                                            Icon: Clock, bg: 'bg-gold-500/10', color: 'text-gold-400',
                                            label: 'Opening Hours', value: '11:00 AM – 11:00 PM',
                                        },
                                        {
                                            Icon: Utensils, bg: 'bg-neon-cyan/10', color: 'text-neon-cyan',
                                            label: 'Available Tables', value: `${TABLE_COUNT} tables`,
                                        },
                                        {
                                            Icon: Mail, bg: 'bg-neon-blue/10', color: 'text-neon-blue',
                                            label: 'Contact Us', value: 'pdnprojectaura17@gmail.com',
                                        },
                                        {
                                            Icon: Phone, bg: 'bg-purple-500/10', color: 'text-purple-400',
                                            label: 'Phone', value: '+94 760 609 159',
                                        },
                                    ].map(({ Icon, bg, color, label, value }) => (
                                        <div key={label} className="flex items-center gap-3.5">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                                                <Icon size={16} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-dark-400 uppercase tracking-wider font-semibold">{label}</div>
                                                <div className="text-sm text-white font-medium leading-snug">{value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Slot duration note */}
                                <div className="mt-6 rounded-xl border border-white/8 bg-dark-800/60 p-4 text-xs text-dark-300 leading-relaxed">
                                    ⏱ Each reservation holds the table for {BOOKING_DURATION_HOURS} hours
                                    — e.g.&nbsp;{formatSlotLabel('19:00')}.
                                </div>
                            </div>
                        </div>

                        {/* ══ RIGHT PANEL — form ══ */}
                        <div className="flex-1 p-6 md:p-8">

                            {/* Section heading */}
                            <div className="mb-7">
                                <h3 className="text-white font-display font-bold text-xl mb-1">Your Details</h3>
                                <p className="text-dark-400 text-sm">All fields marked are required to confirm your reservation.</p>
                            </div>

                            {/* Error banner */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-3 text-red-400"
                                    >
                                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                        <span className="text-sm leading-relaxed">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* ─ Row 1: Name + Email ─ */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Full Name" error={fieldErrors.customerName}>
                                        <input
                                            type="text" required name="customerName"
                                            value={formData.customerName} onChange={handleInputChange}
                                            placeholder="John Doe"
                                            className="aura-input"
                                        />
                                    </Field>
                                    <Field label="Email Address" error={fieldErrors.email}>
                                        <input
                                            type="email" required name="customerEmail"
                                            value={formData.customerEmail} onChange={handleInputChange}
                                            placeholder="john@example.com"
                                            className="aura-input"
                                        />
                                    </Field>
                                </div>

                                {/* ─ Row 2: Phone + Table + Party Size ─ */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Field label="Phone Number" error={fieldErrors.phone}>
                                        <input
                                            type="tel" required name="customerPhone"
                                            value={formData.customerPhone} onChange={handleInputChange}
                                            placeholder="+94 77 123 4567"
                                            className="aura-input"
                                        />
                                    </Field>
                                    <Field label="Table Number" error={fieldErrors.tableNumber}>
                                        <select
                                            name="tableNumber" required
                                            value={formData.tableNumber} onChange={handleInputChange}
                                            className="aura-input appearance-none"
                                        >
                                            {[...Array(TABLE_COUNT)].map((_, i) => (
                                                <option key={i + 1} value={String(i + 1)}>Table {i + 1}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Party Size">
                                        <select
                                            name="partySize" required
                                            value={formData.partySize} onChange={handleInputChange}
                                            className="aura-input appearance-none"
                                        >
                                            {[...Array(20)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                {/* ─ Date picker ─ */}
                                <div className="pt-4 border-t border-white/5">
                                    <label className="aura-label flex items-center gap-1.5 mb-2">
                                        <CalendarIcon size={13} className="text-neon-cyan" />
                                        Reservation Date
                                    </label>
                                    <input
                                        type="date" required name="reservationDate"
                                        min={minReservationDate} max={maxReservationDate}
                                        value={formData.reservationDate} onChange={handleInputChange}
                                        className="aura-input w-full sm:w-64 [color-scheme:dark]"
                                    />
                                    {fieldErrors.reservationTime && (
                                        <p className="text-xs text-red-400 mt-1.5">{fieldErrors.reservationTime}</p>
                                    )}
                                </div>

                                {/* ─ Time slot grid ─ */}
                                <div>
                                    <label className="aura-label flex items-center gap-1.5 mb-3">
                                        <Clock size={13} className="text-neon-cyan" />
                                        Time Slot
                                        {loadingSlots && (
                                            <span className="ml-1 w-3.5 h-3.5 border-2 border-neon-cyan/60 border-t-neon-cyan rounded-full animate-spin" />
                                        )}
                                    </label>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
                                        {slots.map((slot) => {
                                            const isSelected    = formData.timeSlot === slot.time;
                                            const unavailable   = !slot.available || slot.tableAvailable === false;
                                            const tableLabel    = slot.availableTables != null
                                                ? `${slot.availableTables} table${slot.availableTables === 1 ? '' : 's'} free`
                                                : '';

                                            return (
                                                <button
                                                    key={slot.time}
                                                    type="button"
                                                    disabled={unavailable}
                                                    onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot.time }))}
                                                    className={`relative rounded-xl py-3 px-2 text-xs font-semibold transition-all duration-200 border text-center
                                                        ${unavailable
                                                            ? 'bg-dark-800/50 border-dark-700/50 text-dark-600 cursor-not-allowed line-through decoration-dark-600'
                                                            : isSelected
                                                                ? 'bg-neon-blue/20 border-neon-blue text-neon-cyan shadow-[0_0_18px_rgba(76,110,245,0.28)]'
                                                                : 'bg-dark-800/70 border-dark-600/60 text-dark-100 hover:border-gold-500/50 hover:bg-gold-500/6 hover:text-white'
                                                        }`}
                                                >
                                                    {isSelected && !unavailable && (
                                                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                                                    )}
                                                    <div className="leading-snug">{formatSlotLabel(slot.time)}</div>
                                                    {tableLabel && (
                                                        <div className="text-[9px] text-dark-400 mt-0.5">{tableLabel}</div>
                                                    )}
                                                    {slot.tableAvailable === false && (
                                                        <div className="text-[9px] text-red-400 mt-0.5">Table booked</div>
                                                    )}
                                                </button>
                                            );
                                        })}

                                        {slots.length === 0 && !loadingSlots && (
                                            <div className="col-span-full py-8 text-center">
                                                <div className="text-dark-500 text-sm italic">No slots available for this date.</div>
                                            </div>
                                        )}
                                        {loadingSlots && slots.length === 0 && (
                                            <div className="col-span-full py-8 flex items-center justify-center gap-2.5 text-dark-400 text-sm">
                                                <span className="w-4 h-4 border-2 border-neon-cyan/40 border-t-neon-cyan rounded-full animate-spin" />
                                                Checking availability…
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ─ Selected slot summary ─ */}
                                <AnimatePresence>
                                    {formData.timeSlot && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neon-blue/8 border border-neon-blue/20 text-sm text-dark-100"
                                        >
                                            <Clock size={14} className="text-neon-cyan flex-shrink-0" />
                                            <span>
                                                <span className="text-dark-400">Selected:&nbsp;</span>
                                                <span className="text-neon-cyan font-semibold">{formatSlotLabel(formData.timeSlot)}</span>
                                                <span className="text-dark-400"> · Table {formData.tableNumber} · {formData.partySize} {Number(formData.partySize) === 1 ? 'Guest' : 'Guests'}</span>
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* ─ Submit ─ */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !formData.timeSlot || !formData.customerEmail || !formData.customerPhone}
                                        className="w-full relative group overflow-hidden font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-45 disabled:cursor-not-allowed hover:scale-[1.015] hover:shadow-[0_0_36px_rgba(0,245,255,0.35)]"
                                        style={{ background: 'linear-gradient(135deg,#00f5ff,#4c6ef5)' }}
                                    >
                                        <span className="absolute inset-0 bg-white/20 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-600 skew-x-12 pointer-events-none" />
                                        {isSubmitting ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-dark-950/40 border-t-dark-950 rounded-full animate-spin" />
                                                <span className="text-dark-950">Confirming…</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-dark-950">Confirm Reservation</span>
                                                <ChevronRight size={18} className="text-dark-950" />
                                            </>
                                        )}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>

                    {/* Footer note */}
                    <p className="mt-5 text-center text-dark-600 text-xs tracking-wide">
                        Your reservation is confirmed instantly · No deposit required
                    </p>
                </motion.div>
            </main>
        </div>
    );
}

/* ── Shared field wrapper ── */
function Field({ label, error, children }) {
    return (
        <div className="space-y-1.5">
            <label className="aura-label">{label}</label>
            {children}
            {error && <p className="text-[11px] text-red-400 leading-snug">{error}</p>}
        </div>
    );
}
