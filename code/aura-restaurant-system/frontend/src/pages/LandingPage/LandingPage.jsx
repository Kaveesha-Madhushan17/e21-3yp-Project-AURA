import { useState, useEffect, useRef } from 'react';
import {
    motion,
    useScroll,
    useTransform,
    AnimatePresence,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Star, Clock, Utensils, ArrowRight,
    Mail, Phone, MapPin, Instagram, Twitter, Facebook,
    Cpu, Zap, ChevronDown, Shield,
} from 'lucide-react';
import { menuAPI } from '../../api/menuAPI';

/* ─── Asset imports ─── */
import auraLogo      from '../../assets/aura_logo.png';
import introVideo    from '../../assets/aura_intro_video.mp4';
import robotVideo    from '../../assets/robot_video.mp4';
import footerImage   from '../../assets/footer_image.jpg';

import madhushanPhoto   from '../../assets/Madhushan.jpeg';
import dissanayakePhoto from '../../assets/Dissanayake.jpeg';
import amarangaPhoto    from '../../assets/Amaranga.jpeg';
import thennakoonPhoto  from '../../assets/Thennakoon.jpeg';

import salmonImg    from '../../assets/food_images/Aura special Grilled Salmon Fillet.jpg';
import teaCakeImg   from '../../assets/food_images/black-tea-with-chocolade-cake-table.jpg';
import lobsterImg   from '../../assets/food_images/Lobster Risotto.jpg';
import dragonRollImg from '../../assets/food_images/Dragon Roll Sushi.jpg';
import lavaImg      from '../../assets/food_images/Molten Lava Cake.jpg';
import wagyuImg     from '../../assets/food_images/Truffle Wagyu Burger.jpg';

/* ─── Static data ─── */
const FOOD_ITEMS = [
    { img: salmonImg,     name: 'Grilled Salmon Fillet',       category: 'AURA SPECIAL', price: 'LKR 3,200' },
    { img: lobsterImg,    name: 'Lobster Risotto',              category: 'SEAFOOD',      price: 'LKR 4,800' },
    { img: dragonRollImg, name: 'Dragon Roll Sushi',            category: 'JAPANESE',     price: 'LKR 2,900' },
    { img: wagyuImg,      name: 'Truffle Wagyu Burger',         category: 'SIGNATURE',    price: 'LKR 5,500' },
    { img: lavaImg,       name: 'Molten Lava Cake',             category: 'DESSERT',      price: 'LKR 1,800' },
    { img: teaCakeImg,    name: 'Black Tea & Chocolate Cake',   category: 'DESSERT',      price: 'LKR 1,500' },
];

const TEAM_MEMBERS = [
    { id: 'E/21/245', name: 'Madhushan S.K.A.K.',         role: 'Team Member', photo: madhushanPhoto },
    { id: 'E/21/113', name: 'Dissanayake H.G.K.V.D.C.',   role: 'Team Member', photo: dissanayakePhoto },
    { id: 'E/21/024', name: 'Amaranga S.G.I.',             role: 'Team Member', photo: amarangaPhoto },
    { id: 'E/21/407', name: 'Thennakoon T.M.I.I.C.',      role: 'Team Member', photo: thennakoonPhoto },
];

/* ─── Framer Motion variants ─── */
const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

const fadeSlideUp = {
    hidden:  { opacity: 0, y: 50, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const fadeSlideLeft = {
    hidden:  { opacity: 0, x: -55 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const fadeSlideRight = {
    hidden:  { opacity: 0, x: 55 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── 3D Tilt Card ─── */
function TiltCard({ children, className }) {
    const ref = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const onMove = (e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        setTilt({ x: y * 12, y: -x * 12 });
    };

    return (
        <div style={{ perspective: '1000px' }}>
            <motion.div
                ref={ref}
                onMouseMove={onMove}
                onMouseLeave={() => setTilt({ x: 0, y: 0 })}
                animate={{ rotateX: tilt.x, rotateY: tilt.y }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                className={className}
            >
                {children}
            </motion.div>
        </div>
    );
}

/* ─── Scroll-triggered section wrapper ─── */
function RevealSection({ children, className, variants = staggerContainer, ...rest }) {
    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-90px' }}
            className={className}
            {...rest}
        >
            {children}
        </motion.div>
    );
}

/**
 * ============================================================
 *  Landing Page — Futuristic Revamp
 * ============================================================
 *  Public customer-facing page. All backend logic (menuAPI,
 *  useNavigate to /reserve, Staff Login flow) is fully
 *  preserved. Only UI/UX has been overhauled.
 * ============================================================
 */
export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled,       setScrolled]       = useState(false);
    const [menuItems,      setMenuItems]       = useState([]);
    const [activeCategory, setActiveCategory]  = useState('ALL');
    const [loadingMenu,    setLoadingMenu]     = useState(true);

    /* ── Track scroll for sticky nav ── */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Fetch active menu items (existing backend logic) ── */
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const items = await menuAPI.getAvailableItems();
                setMenuItems(items);
            } catch (err) {
                console.error('Failed to load menu', err);
            } finally {
                setLoadingMenu(false);
            }
        };
        fetchMenu();
    }, []);

    const categories   = ['ALL', ...new Set(menuItems.map(item => item.category))];
    const filteredMenu = activeCategory === 'ALL'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);

    /* ── Parallax refs ── */
    const teamSectionRef = useRef(null);
    const { scrollYProgress: teamScroll } = useScroll({
        target: teamSectionRef,
        offset: ['start end', 'end start'],
    });
    const teamBgY = useTransform(teamScroll, [0, 1], ['-12%', '12%']);

    /* ── Staff login (existing logic) ── */
    const handleStaffLogin = () => {
        localStorage.removeItem('aura_token');
        localStorage.removeItem('aura_session');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-dark-950 text-dark-50 font-sans selection:bg-neon-blue selection:text-white overflow-x-hidden">

            {/* ══════════════════════════════════════════════
                NAV — Glassmorphism sticky navigation
            ══════════════════════════════════════════════ */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${
                    scrolled
                        ? 'glass-nav py-3 shadow-[0_4px_40px_rgba(0,0,0,0.4)]'
                        : 'bg-transparent py-5'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <img
                            src={auraLogo}
                            alt="AURA"
                            className="h-10 w-auto object-contain drop-shadow-[0_0_14px_rgba(0,245,255,0.65)]"
                        />
                        <span className="font-display font-bold text-2xl tracking-wide hidden sm:block">
                            AUR<span className="text-neon-cyan">A</span>
                        </span>
                    </div>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        {[
                            { label: 'Cuisine',    href: '#food'  },
                            { label: 'Technology', href: '#robot' },
                            { label: 'Team',       href: '#team'  },
                            { label: 'Menu',       href: '#menu'  },
                        ].map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                className="text-dark-200 hover:text-neon-cyan transition-colors duration-300 relative group"
                            >
                                {label}
                                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-neon-cyan group-hover:w-full transition-all duration-300" />
                            </a>
                        ))}
                        <button
                            onClick={handleStaffLogin}
                            className="text-dark-400 hover:text-white transition-colors duration-300 text-sm"
                        >
                            Staff Login
                        </button>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => navigate('/reserve')}
                        className="btn-glow glass-cyan-btn px-5 py-2.5 rounded-full font-semibold text-sm text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan hover:text-dark-950 transition-all duration-300 shadow-[0_0_18px_rgba(0,245,255,0.15)]"
                    >
                        Reserve Table
                    </button>
                </div>
            </motion.nav>

            {/* ══════════════════════════════════════════════
                HERO — Full-screen video background
            ══════════════════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

                {/* Background video */}
                <video
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                    style={{ filter: 'brightness(0.65) saturate(1.1)' }}
                >
                    <source src={introVideo} type="video/mp4" />
                </video>

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-dark-950/30 to-dark-950" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-950/30 via-transparent to-dark-950/30" />

                {/* Subtle grid */}
                <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />

                {/* Animated scan line */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="hero-scan-line" />
                </div>

                {/* Hero content */}
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-24">

                    {/* Logo orb */}
                    <motion.div
                        initial={{ scale: 0.75, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-neon-cyan blur-[90px] opacity-20 rounded-full animate-pulse-soft" />
                            <img
                                src={auraLogo}
                                alt="AURA Logo"
                                className="w-36 h-36 md:w-52 md:h-52 object-contain animate-float drop-shadow-[0_0_30px_rgba(0,245,255,0.4)] relative z-10"
                            />
                        </div>
                    </motion.div>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 backdrop-blur-sm text-neon-cyan text-xs font-bold tracking-[0.2em] uppercase mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                        Automated Urban Restaurant Assistant
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ y: 45, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.38, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl sm:text-6xl md:text-8xl font-display font-black mb-6 leading-[1.04] tracking-tight"
                    >
                        The Future of<br />
                        <span className="text-gradient-gold italic font-light">Fine Dining</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.52, duration: 0.65 }}
                        className="text-lg md:text-xl text-dark-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        Experience culinary excellence delivered with robotic precision.
                        A seamless blend of gourmet artistry and cutting-edge automation.
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.66, duration: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={() => navigate('/reserve')}
                            className="hero-btn-gold group relative bg-gradient-to-r from-gold-400 to-gold-600 text-dark-950 font-bold px-9 py-4 rounded-full flex items-center gap-2.5 hover:shadow-[0_0_45px_rgba(250,204,21,0.55)] transition-all duration-300 hover:scale-105 overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-white/25 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-600 skew-x-12" />
                            <Calendar size={18} />
                            Book Your Experience
                        </button>
                        <a
                            href="#food"
                            className="glass-hero-btn px-9 py-4 rounded-full flex items-center gap-2.5 font-medium border border-white/20 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all duration-300 backdrop-blur-sm"
                        >
                            <Utensils size={18} />
                            Explore Cuisine
                        </a>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-400 text-xs tracking-widest uppercase cursor-pointer"
                    onClick={() => document.getElementById('food')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <span>Scroll</span>
                    <ChevronDown size={16} />
                </motion.div>
            </section>

            {/* ══════════════════════════════════════════════
                FOOD SHOWCASE — Scroll-triggered slide-in cards
            ══════════════════════════════════════════════ */}
            <section id="food" className="relative py-24 md:py-36 bg-dark-950 overflow-hidden">

                {/* Ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gold-500/4 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-neon-blue/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6">

                    {/* Section header */}
                    <RevealSection variants={staggerContainer} className="text-center mb-16">
                        <motion.p variants={fadeSlideUp} className="text-gold-400 font-bold tracking-[0.25em] uppercase text-sm mb-3">
                            Culinary Masterpieces
                        </motion.p>
                        <motion.h2 variants={fadeSlideUp} className="text-4xl md:text-6xl font-display font-black mb-4">
                            Crafted to <span className="text-gradient-gold">Perfection</span>
                        </motion.h2>
                        <motion.p variants={fadeSlideUp} className="text-dark-300 text-lg max-w-xl mx-auto">
                            Every dish is an artform. Every bite, an experience you won&apos;t forget.
                        </motion.p>
                    </RevealSection>

                    {/* Food grid */}
                    <RevealSection variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FOOD_ITEMS.map((item, i) => (
                            <motion.div key={i} variants={fadeSlideUp}>
                                <TiltCard className="food-showcase-card group relative rounded-2xl overflow-hidden border border-white/5 cursor-pointer h-[320px]">
                                    {/* Food image */}
                                    <img
                                        src={item.img}
                                        alt={item.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-transparent" />

                                    {/* Category badge */}
                                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-bold tracking-wider backdrop-blur-sm">
                                        {item.category}
                                    </div>

                                    {/* Price badge */}
                                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-dark-950/75 backdrop-blur-md text-gold-400 text-xs font-bold border border-gold-500/25">
                                        {item.price}
                                    </div>

                                    {/* Bottom info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <h3 className="text-white font-bold text-xl mb-2 drop-shadow-md">{item.name}</h3>
                                        <div className="flex items-center gap-1.5 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                                            <span className="text-neon-cyan text-sm font-medium">View Details</span>
                                            <ArrowRight size={13} className="text-neon-cyan" />
                                        </div>
                                    </div>

                                    {/* Hover glow border */}
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-neon-cyan/25 rounded-2xl transition-all duration-500 pointer-events-none" />
                                </TiltCard>
                            </motion.div>
                        ))}
                    </RevealSection>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                ROBOT TECH SHOWCASE
            ══════════════════════════════════════════════ */}
            <section id="robot" className="relative py-24 md:py-36 overflow-hidden bg-dark-900">

                {/* Tech grid & ambient glows */}
                <div className="absolute inset-0 bg-grid opacity-12 pointer-events-none" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-neon-blue/6 blur-[110px] rounded-full pointer-events-none" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-neon-cyan/4 blur-[90px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

                        {/* ── Text column ── */}
                        <RevealSection variants={staggerContainer}>
                            <motion.p variants={fadeSlideLeft} className="text-neon-cyan font-bold tracking-[0.22em] uppercase text-sm mb-4 flex items-center gap-2">
                                <Cpu size={13} />
                                Powered by AI &amp; Robotics
                            </motion.p>
                            <motion.h2 variants={fadeSlideLeft} className="text-4xl md:text-6xl font-display font-black mb-6 leading-tight">
                                Meet the <span className="gradient-text">AURA Robot</span>
                            </motion.h2>
                            <motion.p variants={fadeSlideLeft} className="text-dark-200 text-lg leading-relaxed mb-8">
                                Our state-of-the-art autonomous dining companion navigates
                                your dining experience with millimeter precision —
                                from kitchen to table in under 60 seconds, every single time.
                            </motion.p>

                            {/* Feature list */}
                            <div className="space-y-4">
                                {[
                                    { icon: <Star    size={17} className="text-gold-400"      />, title: 'Precision Navigation',  desc: 'LiDAR-guided autonomous pathfinding with real-time obstacle avoidance.' },
                                    { icon: <Clock   size={17} className="text-neon-cyan"     />, title: 'Zero Wait Time',        desc: 'Instant kitchen-to-table routing, continuously optimised.' },
                                    { icon: <Zap     size={17} className="text-neon-purple"   />, title: 'Smart Interaction',     desc: 'Voice-activated UI and AI-driven menu recommendations on the robot.' },
                                    { icon: <Shield  size={17} className="text-neon-green"    />, title: 'Contactless & Hygienic',desc: 'Fully automated delivery — minimising human contact.' },
                                ].map((f, i) => (
                                    <motion.div
                                        key={i}
                                        variants={fadeSlideLeft}
                                        className="flex items-start gap-4 glass rounded-xl p-4 border-white/5 hover:border-neon-cyan/20 transition-colors duration-300"
                                    >
                                        <div className="p-2 rounded-lg bg-dark-800 border border-white/8 flex-shrink-0">{f.icon}</div>
                                        <div>
                                            <h4 className="text-white font-semibold text-sm mb-0.5">{f.title}</h4>
                                            <p className="text-dark-300 text-sm leading-relaxed">{f.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </RevealSection>

                        {/* ── Portrait video column ── */}
                        <RevealSection variants={staggerContainer} className="flex justify-center lg:justify-end">
                            <motion.div variants={fadeSlideRight} className="robot-video-wrapper relative">

                                {/* Outer glow ring */}
                                <div className="absolute -inset-4 rounded-[2.8rem] bg-gradient-to-b from-neon-cyan/25 via-neon-blue/15 to-neon-cyan/25 blur-lg animate-pulse-soft pointer-events-none" />

                                {/* Corner bracket decorations */}
                                {[
                                    'top-0 left-0 border-t-2 border-l-2 rounded-tl-xl',
                                    'top-0 right-0 border-t-2 border-r-2 rounded-tr-xl',
                                    'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl',
                                    'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl',
                                ].map((cls, i) => (
                                    <div key={i} className={`absolute w-6 h-6 border-neon-cyan ${cls} -translate-x-1 -translate-y-1`}
                                         style={{ margin: i < 2 ? '-6px' : '6px' }}
                                    />
                                ))}

                                {/* 9:16 portrait video frame */}
                                <div
                                    className="relative w-[270px] md:w-[310px] rounded-[2.2rem] overflow-hidden border border-neon-cyan/20 shadow-[0_0_70px_rgba(0,245,255,0.14),_0_0_140px_rgba(76,110,245,0.08)]"
                                    style={{ aspectRatio: '9/16' }}
                                >
                                    <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                                        <source src={robotVideo} type="video/mp4" />
                                    </video>

                                    {/* CRT scanline overlay */}
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
                                        }}
                                    />

                                    {/* HUD overlays */}
                                    <div className="absolute top-4 left-3 right-3 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 bg-dark-950/75 backdrop-blur-sm px-2.5 py-1 rounded-full border border-neon-cyan/25">
                                            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                                            <span className="text-neon-cyan text-[10px] font-bold tracking-widest">LIVE</span>
                                        </div>
                                        <div className="bg-dark-950/75 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                                            <span className="text-white text-[10px] font-mono tracking-wider">AURA-01</span>
                                        </div>
                                    </div>

                                    {/* Bottom HUD */}
                                    <div className="absolute bottom-4 left-3 right-3">
                                        <div className="bg-dark-950/75 backdrop-blur-sm rounded-xl border border-white/10 p-2.5 flex items-center justify-between">
                                            <div>
                                                <div className="text-neon-cyan text-[9px] font-bold tracking-widest uppercase mb-0.5">Status</div>
                                                <div className="text-white text-[11px] font-mono">Active · Serving</div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border-2 border-neon-cyan/40 flex items-center justify-center">
                                                <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </RevealSection>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                MEET THE TEAM
            ══════════════════════════════════════════════ */}
            <section id="team" ref={teamSectionRef} className="relative py-24 md:py-36 overflow-hidden bg-dark-950">

                {/* Parallax background montage */}
                <motion.div style={{ y: teamBgY }} className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage: `url(${madhushanPhoto}), url(${dissanayakePhoto}), url(${amarangaPhoto}), url(${thennakoonPhoto})`,
                            backgroundSize: '25% auto',
                            backgroundPosition: '0% 50%, 25% 50%, 50% 50%, 75% 50%',
                            backgroundRepeat: 'no-repeat',
                            filter: 'blur(3px) grayscale(100%) saturate(0)',
                        }}
                    />
                    <div className="absolute inset-0 bg-dark-950/92" />
                </motion.div>

                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-neon-blue/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6">

                    {/* Section header */}
                    <RevealSection variants={staggerContainer} className="text-center mb-16">
                        <motion.p variants={fadeSlideUp} className="text-neon-cyan font-bold tracking-[0.25em] uppercase text-sm mb-3">
                            The Builders
                        </motion.p>
                        <motion.h2 variants={fadeSlideUp} className="text-4xl md:text-6xl font-display font-black mb-4">
                            Meet the <span className="text-gradient-gold">Team</span>
                        </motion.h2>
                        <motion.p variants={fadeSlideUp} className="text-dark-300 text-lg max-w-xl mx-auto">
                            Final-year Computer Engineering undergraduates, University of Peradeniya.
                        </motion.p>
                    </RevealSection>

                    {/* Team cards */}
                    <RevealSection variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TEAM_MEMBERS.map((member, i) => (
                            <motion.div
                                key={i}
                                variants={fadeSlideUp}
                                whileHover={{ y: -10, transition: { duration: 0.3, ease: 'easeOut' } }}
                                className="team-member-card group relative glass rounded-2xl overflow-hidden border border-white/5 cursor-default"
                            >
                                {/* Photo */}
                                <div className="relative h-60 overflow-hidden">
                                    <img
                                        src={member.photo}
                                        alt={member.name}
                                        className="w-full h-full object-cover object-top transition-transform duration-600 group-hover:scale-107"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/10 to-transparent" />

                                    {/* ID overlay */}
                                    <div className="absolute top-3 right-3 bg-dark-950/75 backdrop-blur-sm px-2.5 py-1 rounded-full border border-neon-cyan/20">
                                        <span className="text-neon-cyan text-[10px] font-mono tracking-wider">{member.id}</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <h3 className="text-white font-bold text-sm leading-snug mb-2">{member.name}</h3>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-800 border border-white/8 text-dark-300 text-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                                        {member.role}
                                    </div>
                                </div>

                                {/* Hover glow */}
                                <div className="absolute inset-0 border border-transparent group-hover:border-neon-cyan/20 rounded-2xl transition-all duration-400 pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/0 group-hover:from-neon-cyan/3 to-transparent rounded-2xl transition-all duration-400 pointer-events-none" />
                            </motion.div>
                        ))}
                    </RevealSection>

                    {/* University badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mt-14 text-center"
                    >
                        <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                            <span className="text-dark-300 text-sm">
                                Department of Computer Engineering · University of Peradeniya · Batch E/21
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                LIVE MENU — Dynamic backend-driven section
            ══════════════════════════════════════════════ */}
            <section id="menu" className="landing-section bg-dark-900 border-y border-white/5 relative overflow-hidden">

                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-cyan/4 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-12"
                    >
                        <p className="text-gold-400 font-bold tracking-[0.25em] uppercase text-sm mb-3">Culinary Art</p>
                        <h2 className="text-4xl md:text-5xl font-display font-black">Discover Our Menu</h2>
                    </motion.div>

                    {/* Category Tabs */}
                    <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-6 mb-8 justify-start md:justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2.5 rounded-full whitespace-nowrap font-semibold text-sm transition-all duration-300 ${
                                    activeCategory === cat
                                        ? 'bg-neon-cyan text-dark-950 shadow-[0_0_22px_rgba(0,245,255,0.4)]'
                                        : 'glass text-dark-200 hover:text-white hover:bg-white/10 border border-white/10'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Menu Grid (existing backend-driven logic) */}
                    {loadingMenu ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredMenu.slice(0, 6).map((item) => (
                                    <motion.div
                                        key={item.menuItemId ?? item.id ?? item.name}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.35 }}
                                        className="glass rounded-2xl overflow-hidden group hover:border-neon-cyan/35 transition-all duration-300 border border-white/5 hover:shadow-[0_0_30px_rgba(0,245,255,0.06)]"
                                    >
                                        <div className="h-48 bg-dark-800 relative overflow-hidden">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-dark-500">
                                                    <Utensils size={40} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-dark-950/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-gold-400 border border-gold-500/25">
                                                LKR {item.price.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="text-xs font-bold tracking-wider text-neon-cyan uppercase mb-2">{item.category}</div>
                                            <h4 className="text-xl font-bold text-white mb-2">{item.name}</h4>
                                            <p className="text-dark-300 text-sm line-clamp-2">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                FOOTER — Robot banner + links
            ══════════════════════════════════════════════ */}
            <footer className="relative overflow-hidden">

                {/* Footer background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${footerImage})`, filter: 'brightness(0.5) saturate(0.8)' }}
                />

                {/* Dark gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/80 to-dark-950/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-950/70 via-transparent to-dark-950/70" />
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

                {/* CTA banner */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 35 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className="text-neon-cyan font-bold tracking-[0.22em] uppercase text-sm mb-3 flex items-center justify-center gap-2">
                            <span className="w-8 h-px bg-neon-cyan/50" />
                            Experience the Future
                            <span className="w-8 h-px bg-neon-cyan/50" />
                        </p>
                        <h2 className="text-4xl md:text-6xl font-display font-black mb-5">
                            Ready for the Future?
                        </h2>
                        <p className="text-dark-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                            Secure your table now and experience the ultimate fusion of gourmet dining
                            and autonomous robotics.
                        </p>
                        <button
                            onClick={() => navigate('/reserve')}
                            className="hero-btn-gold group relative bg-gradient-to-r from-gold-400 to-gold-600 text-dark-950 font-bold px-10 py-4 rounded-full inline-flex items-center gap-2.5 hover:shadow-[0_0_45px_rgba(250,204,21,0.55)] transition-all duration-300 hover:scale-105 overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-white/25 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 skew-x-12" />
                            Reserve Your Table
                            <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>

                {/* Footer links */}
                <div className="relative z-10 border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

                            {/* Brand column */}
                            <div className="flex flex-col items-start gap-3">
                                <div className="flex items-center gap-2">
                                    <img src={auraLogo} alt="AURA" className="h-8 w-auto object-contain drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]" />
                                    <span className="font-display font-bold text-xl">AUR<span className="text-neon-cyan">A</span></span>
                                </div>
                                <p className="text-dark-400 text-sm leading-relaxed">
                                    Automated Urban Restaurant Assistant — where technology meets taste.
                                </p>
                                <div className="flex items-center gap-2.5 mt-1">
                                    {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                        <a
                                            key={i}
                                            href="#"
                                            aria-label="Social link"
                                            className="p-2 rounded-full border border-white/10 text-dark-400 hover:text-neon-cyan hover:border-neon-cyan/35 transition-all duration-300"
                                        >
                                            <Icon size={14} />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Quick links */}
                            <div>
                                <h4 className="text-white font-semibold text-xs mb-5 tracking-[0.18em] uppercase">Quick Links</h4>
                                <ul className="space-y-3">
                                    {[
                                        { label: 'Our Cuisine',    href: '#food'  },
                                        { label: 'AURA Technology',href: '#robot' },
                                        { label: 'Meet the Team',  href: '#team'  },
                                        { label: 'Menu',           href: '#menu'  },
                                        { label: 'Reserve a Table',href: '/reserve', onClick: () => navigate('/reserve') },
                                    ].map((link) => (
                                        <li key={link.label}>
                                            {link.onClick ? (
                                                <button onClick={link.onClick} className="text-dark-400 hover:text-neon-cyan transition-colors text-sm flex items-center gap-1.5 group">
                                                    <ArrowRight size={11} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                                    {link.label}
                                                </button>
                                            ) : (
                                                <a href={link.href} className="text-dark-400 hover:text-neon-cyan transition-colors text-sm flex items-center gap-1.5 group">
                                                    <ArrowRight size={11} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                                    {link.label}
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="text-white font-semibold text-xs mb-5 tracking-[0.18em] uppercase">Contact</h4>
                                <ul className="space-y-3.5">
                                    {[
                                        { icon: MapPin, text: 'University of Peradeniya, Sri Lanka' },
                                        { icon: Mail,   text: 'aura@eng.pdn.ac.lk'                 },
                                        { icon: Phone,  text: '+94 81 239 3500'                     },
                                    ].map(({ icon: Icon, text }, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-dark-400 text-sm">
                                            <Icon size={13} className="mt-0.5 flex-shrink-0 text-neon-cyan" />
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Bottom bar */}
                        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-dark-500 text-xs">
                            <p>© {new Date().getFullYear()} AURA Restaurant System. All rights reserved.</p>
                            <p>Built by Engineering Undergraduates · University of Peradeniya</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
