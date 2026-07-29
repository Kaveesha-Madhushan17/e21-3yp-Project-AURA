/**
 * ============================================================
 *  LandingPage.jsx — AURA Restaurant System
 *  GSAP + ScrollTrigger + Lenis  |  Neon-Arrow Cursor
 * ============================================================
 *  Sections:
 *   1. Hero          — full-screen video
 *   2. Culinary Art  — asset food images as gallery CARDS
 *   3. Our Menu      — REAL DB menu as parallax CAROUSEL
 *   4. Robot         — 5 feature cards (Instant Order & Pay replaces AI Upselling)
 *   5. Meet the Team — parallax mosaic
 *   6. Footer
 *
 *  CRITICAL: menuAPI.getAvailableItems() & staff login PRESERVED.
 *  DB fields used: name, category, imageUrl, emoji, description
 *  price is intentionally NEVER displayed.
 * ============================================================
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence }                   from 'framer-motion';
import { useNavigate }                               from 'react-router-dom';
import {
    ArrowRight, ChevronDown, ChevronLeft, ChevronRight,
    Mail, Phone, MapPin, Instagram, Twitter, Facebook,
    Mic, Smile, Gamepad2, Eye, CreditCard, Loader2,
} from 'lucide-react';
import gsap              from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis             from 'lenis';
import { menuAPI }       from '../../api/menuAPI';

gsap.registerPlugin(ScrollTrigger);

/* ── Asset imports ──────────────────────────────────────────── */
import auraLogo       from '../../assets/aura_logo.png';
import faviconImg     from '../../assets/favicon.png';
import introVideo     from '../../assets/aura_intro_video.mp4';
import robotVideo     from '../../assets/robot_video.mp4';
import footerImage    from '../../assets/footer_image.jpg';

import madhushanPhoto   from '../../assets/Madhushan.jpeg';
import dissanayakePhoto from '../../assets/Dissanayake.jpeg';
import amarangaPhoto    from '../../assets/Amaranga.jpeg';
import thennakoonPhoto  from '../../assets/Thennakoon.jpeg';

/* Food gallery images (Section 2 — gallery CARDS, not carousel) */
import salmonImg     from '../../assets/food_images/Aura special Grilled Salmon Fillet.jpg';
import teaCakeImg    from '../../assets/food_images/black-tea-with-chocolade-cake-table.jpg';
import lobsterImg    from '../../assets/food_images/Lobster Risotto.jpg';
import dragonRollImg from '../../assets/food_images/Dragon Roll Sushi.jpg';
import lavaImg       from '../../assets/food_images/Molten Lava Cake.jpg';
import wagyuImg      from '../../assets/food_images/Truffle Wagyu Burger.jpg';

/* ── Static data ────────────────────────────────────────────── */

/** Gallery cards — asset images only (Section 2) */
const GALLERY_ITEMS = [
    { img: salmonImg,     name: 'Grilled Salmon Fillet',      category: 'AURA SPECIAL' },
    { img: lobsterImg,    name: 'Lobster Risotto',            category: 'SEAFOOD'      },
    { img: dragonRollImg, name: 'Dragon Roll Sushi',          category: 'JAPANESE'     },
    { img: wagyuImg,      name: 'Truffle Wagyu Burger',       category: 'SIGNATURE'    },
    { img: lavaImg,       name: 'Molten Lava Cake',           category: 'DESSERT'      },
    { img: teaCakeImg,    name: 'Black Tea & Chocolate Cake', category: 'DESSERT'      },
];

/** Robot features — index 1 changed to Instant Order & Pay */
const ROBOT_FEATURES = [
    {
        Icon: Eye,
        colorClass: 'text-neon-cyan',
        borderClass: 'border-neon-cyan/20',
        bgClass: 'bg-neon-cyan/5',
        title: 'Responsive Interaction',
        desc:  'Physically turns to face you using advanced touch sensors for a truly personal experience.',
    },
    {
        Icon: CreditCard,
        colorClass: 'text-gold-400',
        borderClass: 'border-gold-500/20',
        bgClass: 'bg-gold-500/5',
        title: 'Instant Order & Pay',
        desc:  'Add items to your order or settle the bill in seconds — right from the table. No waiting for staff, ever.',
    },
    {
        Icon: Mic,
        colorClass: 'text-neon-blue',
        borderClass: 'border-neon-blue/20',
        bgClass: 'bg-neon-blue/5',
        title: 'Voice Commands',
        desc:  'Hands-free ordering — just say "Hey AURA" and let the future serve you.',
    },
    {
        Icon: Smile,
        colorClass: 'text-pink-400',
        borderClass: 'border-pink-400/20',
        bgClass: 'bg-pink-400/5',
        title: 'Expression Recognition',
        desc:  'Reads your mood in real-time to offer proactive and personalized assistance.',
    },
    {
        Icon: Gamepad2,
        colorClass: 'text-purple-400',
        borderClass: 'border-purple-500/20',
        bgClass: 'bg-purple-500/5',
        title: 'Interactive Entertainment',
        desc:  'Mini-games, background music, and an automated Birthday Celebration mode.',
    },
];

const TEAM_MEMBERS = [
    { id: 'E/21/245', name: 'Madhushan S.K.A.K.',       photo: madhushanPhoto   },
    { id: 'E/21/113', name: 'Dissanayake H.G.K.V.D.C.', photo: dissanayakePhoto },
    { id: 'E/21/024', name: 'Amaranga S.G.I.',           photo: amarangaPhoto    },
    { id: 'E/21/407', name: 'Thennakoon T.M.I.I.C.',    photo: thennakoonPhoto  },
];

/* ── Category → gradient background (for DB items without images) ── */
const getCategoryStyle = (category = '') => {
    const c = (category || '').toLowerCase();
    if (/dessert|cake|sweet|chocolate|ice/.test(c))
        return { background: 'linear-gradient(145deg,rgba(136,19,55,0.92),rgba(10,5,15,0.97))' };
    if (/sea|fish|prawn|lobster|crab|shrimp/.test(c))
        return { background: 'linear-gradient(145deg,rgba(12,74,110,0.92),rgba(5,10,25,0.97))' };
    if (/drink|beverage|juice|coffee|tea/.test(c))
        return { background: 'linear-gradient(145deg,rgba(7,89,133,0.92),rgba(5,8,20,0.97))' };
    if (/salad|vegetarian|veg|plant|green/.test(c))
        return { background: 'linear-gradient(145deg,rgba(6,78,59,0.92),rgba(5,12,8,0.97))' };
    if (/burger|sandwich|wrap/.test(c))
        return { background: 'linear-gradient(145deg,rgba(146,64,14,0.92),rgba(15,8,4,0.97))' };
    if (/beef|steak|wagyu|lamb|mutton/.test(c))
        return { background: 'linear-gradient(145deg,rgba(127,29,29,0.92),rgba(12,4,4,0.97))' };
    if (/chicken|poultry|turkey/.test(c))
        return { background: 'linear-gradient(145deg,rgba(133,77,14,0.92),rgba(14,10,4,0.97))' };
    if (/sushi|japanese|ramen/.test(c))
        return { background: 'linear-gradient(145deg,rgba(109,7,26,0.92),rgba(8,8,18,0.97))' };
    if (/pizza|italian|pasta/.test(c))
        return { background: 'linear-gradient(145deg,rgba(154,52,18,0.92),rgba(14,6,4,0.97))' };
    if (/soup|stew|broth/.test(c))
        return { background: 'linear-gradient(145deg,rgba(120,53,15,0.92),rgba(12,8,4,0.97))' };
    if (/starter|appetizer|snack/.test(c))
        return { background: 'linear-gradient(145deg,rgba(4,120,87,0.92),rgba(4,12,10,0.97))' };
    /* default — neon indigo */
    return { background: 'linear-gradient(145deg,rgba(30,58,138,0.92),rgba(5,5,22,0.97))' };
};

/* ══════════════════════════════════════════════════════════════
   Component
══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
    const navigate = useNavigate();

    /* ── UI state ── */
    const [scrolled,      setScrolled]      = useState(false);
    const [currentSlide,  setCurrentSlide]  = useState(0);  /* DB menu carousel */
    const [isPaused,      setIsPaused]      = useState(false);

    /* ── Backend state (preserved) ── */
    const [menuItems,   setMenuItems]   = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(true);

    /* ── Refs ── */
    const pageRef         = useRef(null);
    const gallerySectionRef = useRef(null); /* Section 2 — hero scroll target */
    const menuSectionRef  = useRef(null);   /* Section 3 — DB carousel */
    const featuresRef     = useRef(null);
    const teamSectionRef  = useRef(null);
    const teamBgRef       = useRef(null);
    const touchStartX     = useRef(0);

    /* ── Custom cursor refs ── */
    const cursorArrowRef = useRef(null); /* SVG arrow element  */
    const cursorRingRef  = useRef(null); /* trailing ring blob */

    /* Derived: safe total for carousel */
    const MENU_TOTAL = menuItems.length;

    /* ─────────────────────────────────────────────────────────
       Favicon
    ──────────────────────────────────────────────────────────*/
    useEffect(() => {
        const link = document.querySelector("link[rel~='icon']") ?? document.createElement('link');
        link.rel  = 'icon';
        link.type = 'image/png';
        link.href = faviconImg;
        document.head.appendChild(link);
    }, []);

    /* ─────────────────────────────────────────────────────────
       Nav scroll state
    ──────────────────────────────────────────────────────────*/
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);

    /* ─────────────────────────────────────────────────────────
       Backend: fetch real menu (PRESERVED — do not remove)
    ──────────────────────────────────────────────────────────*/
    useEffect(() => {
        (async () => {
            try {
                const items = await menuAPI.getAvailableItems();
                setMenuItems(Array.isArray(items) ? items : []);
            } catch (err) {
                console.error('Failed to load menu:', err);
                setMenuItems([]);
            } finally {
                setLoadingMenu(false);
            }
        })();
    }, []);

    /* Reset carousel when menu data arrives */
    useEffect(() => { setCurrentSlide(0); }, [menuItems]);

    /* ─────────────────────────────────────────────────────────
       Custom cursor — neon-blue SVG arrow + lagging ring
       Only on pointer:fine (mouse/trackpad devices)
    ──────────────────────────────────────────────────────────*/
    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const arrow = cursorArrowRef.current;
        const ring  = cursorRingRef.current;
        if (!arrow || !ring) return;

        const RING_W  = 38;  /* ring diameter px */
        const HALF_R  = RING_W / 2;
        const data    = { x: -200, y: -200, rx: -200, ry: -200 };

        /* quickSetters — zero-overhead RAF writes */
        const setAX = gsap.quickSetter(arrow, 'x', 'px');
        const setAY = gsap.quickSetter(arrow, 'y', 'px');
        const setRX = gsap.quickSetter(ring,  'x', 'px');
        const setRY = gsap.quickSetter(ring,  'y', 'px');

        /* Start hidden off-screen */
        gsap.set([arrow, ring], { x: -200, y: -200, opacity: 0 });

        let visible = false;

        /* Dot follows instantly; ring lerps at 0.11 factor */
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

        /* Ticker drives ring lerp — buttery smooth lag */
        const tick = () => {
            data.rx += (data.x - data.rx) * 0.11;
            data.ry += (data.y - data.ry) * 0.11;
            setRX(data.rx - HALF_R);
            setRY(data.ry - HALF_R);
        };

        /* Hover over button/link → ring expands gold */
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

        /* Click micro-animation */
        const onDown = () => gsap.to(arrow, { scale: 0.8, transformOrigin: '0% 0%', duration: 0.1, ease: 'power2.in' });
        const onUp   = () => gsap.to(arrow, { scale: 1,   transformOrigin: '0% 0%', duration: 0.4, ease: 'elastic.out(1,0.45)' });

        /* Hide on viewport leave */
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

    /* ─────────────────────────────────────────────────────────
       GSAP + Lenis scroll animations
    ──────────────────────────────────────────────────────────*/
    useEffect(() => {
        const lenis = new Lenis({ lerp: 0.08 });
        const rafCb = (t) => lenis.raf(t * 1000);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(rafCb);
        gsap.ticker.lagSmoothing(0);

        const ctx = gsap.context(() => {
            /* Initial hidden state */
            gsap.set('.gallery-card',          { opacity: 0, y: 42, scale: 0.95 });
            gsap.set('.robot-feature-card',    { opacity: 0, y: 64, scale: 0.92 });
            gsap.set('.team-member-card-gsap', { opacity: 0, y: 48, scale: 0.95 });

            /* Gallery cards stagger in */
            gsap.to('.gallery-card', {
                opacity: 1, y: 0, scale: 1,
                duration: 0.85, stagger: 0.1, ease: 'power3.out',
                scrollTrigger: {
                    trigger: gallerySectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
            });

            /* Robot cards stagger + float */
            gsap.to('.robot-feature-card', {
                opacity: 1, y: 0, scale: 1,
                duration: 0.7, stagger: 0.13, ease: 'power3.out',
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: 'top 76%',
                    toggleActions: 'play none none none',
                },
                onComplete() {
                    gsap.to('.robot-feature-card', {
                        y: '-=9', duration: 3, repeat: -1, yoyo: true,
                        ease: 'sine.inOut', stagger: { each: 0.5, from: 'random' },
                    });
                },
            });

            /* Team parallax bg */
            if (teamBgRef.current && teamSectionRef.current) {
                gsap.to(teamBgRef.current, {
                    yPercent: -24, ease: 'none',
                    scrollTrigger: {
                        trigger: teamSectionRef.current,
                        start: 'top bottom', end: 'bottom top', scrub: 1.2,
                    },
                });
            }

            /* Team cards stagger */
            gsap.to('.team-member-card-gsap', {
                opacity: 1, y: 0, scale: 1,
                duration: 0.65, stagger: 0.12, ease: 'power3.out',
                scrollTrigger: {
                    trigger: teamSectionRef.current,
                    start: 'top 78%',
                    toggleActions: 'play none none none',
                },
            });
        }, pageRef);

        return () => {
            ctx.revert();
            ScrollTrigger.getAll().forEach(t => t.kill());
            lenis.destroy();
            gsap.ticker.remove(rafCb);
        };
    }, []);

    /* ─────────────────────────────────────────────────────────
       DB Menu Carousel: keyboard + auto-advance + touch
    ──────────────────────────────────────────────────────────*/
    useEffect(() => {
        if (MENU_TOTAL === 0) return;
        const h = (e) => {
            if (e.key === 'ArrowLeft')  setCurrentSlide(c => (c - 1 + MENU_TOTAL) % MENU_TOTAL);
            if (e.key === 'ArrowRight') setCurrentSlide(c => (c + 1) % MENU_TOTAL);
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [MENU_TOTAL]);

    useEffect(() => {
        if (isPaused || MENU_TOTAL === 0) return;
        const id = setInterval(() => setCurrentSlide(c => (c + 1) % MENU_TOTAL), 5500);
        return () => clearInterval(id);
    }, [isPaused, MENU_TOTAL]);

    /* 3D tilt handlers for DB carousel */
    const onTiltMove = (e) => {
        const el = e.currentTarget;
        const r  = el.getBoundingClientRect();
        const x  = (e.clientX - r.left)  / r.width  - 0.5;
        const y  = (e.clientY - r.top)   / r.height - 0.5;
        el.style.transform  = `perspective(1200px) rotateX(${y * -4.5}deg) rotateY(${x * 4.5}deg)`;
        el.style.transition = 'transform 0.1s linear';
    };
    const onTiltLeave = useCallback((e) => {
        if (e?.currentTarget) {
            e.currentTarget.style.transform  = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
            e.currentTarget.style.transition = 'transform 0.65s ease-out';
        }
    }, []);

    const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd   = (e) => {
        if (MENU_TOTAL === 0) return;
        const dx = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 50) {
            if (dx > 0) setCurrentSlide(c => (c + 1) % MENU_TOTAL);
            else        setCurrentSlide(c => (c - 1 + MENU_TOTAL) % MENU_TOTAL);
        }
    };

    /* ─────────────────────────────────────────────────────────
       Helpers
    ──────────────────────────────────────────────────────────*/
    const scrollToGallery  = () => gallerySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const handleStaffLogin = () => {
        localStorage.removeItem('aura_token');
        localStorage.removeItem('aura_session');
        window.location.href = '/login';
    };

    /* Current DB item helpers (defensive — uses actual Spring field names) */
    const curItem = menuItems[currentSlide] ?? null;
    const curName = curItem?.name       ?? '—';
    const curCat  = curItem?.category   ?? 'Specialty';
    const curImg  = curItem?.imageUrl   ?? null;
    const curEmoji= curItem?.emoji      ?? '';
    const curDesc = curItem?.description ?? '';

    /* ═══════════════════════════════════════════════════════
       Render
    ═══════════════════════════════════════════════════════ */
    return (
        <div ref={pageRef} className="aura-landing min-h-screen bg-dark-950 text-dark-50 font-sans overflow-x-hidden">

            {/* ── Neon-Blue Arrow Cursor ──────────────────────────
                Arrow tip = hotspot; ring lerps behind with lag
            ────────────────────────────────────────────────── */}
            <svg
                ref={cursorArrowRef}
                className="cursor-arrow-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 18 24"
                width="18" height="24"
                aria-hidden="true"
                focusable="false"
            >
                <defs>
                    <linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#00f5ff" />
                        <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                </defs>
                {/* Standard cursor-arrow shape; hotspot at SVG origin (0,0) */}
                <path
                    d="M 0 0 L 0 18 L 5 13 L 8.5 21.5 L 12 20 L 8.5 12 L 16 12 Z"
                    fill="url(#ag)"
                    stroke="rgba(0,200,255,0.25)"
                    strokeWidth="0.6"
                    strokeLinejoin="round"
                />
            </svg>
            <div ref={cursorRingRef} className="cursor-ring-follow" />

            {/* ══════════════════════════════════════════════
                NAV
            ══════════════════════════════════════════════ */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${
                    scrolled
                        ? 'bg-dark-950/85 backdrop-blur-xl border-b border-white/8 py-3 shadow-[0_4px_40px_rgba(0,0,0,0.5)]'
                        : 'bg-transparent py-5'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={auraLogo} alt="AURA"
                            className="h-10 w-auto object-contain drop-shadow-[0_0_14px_rgba(0,245,255,0.65)]" />
                        <span className="font-display font-bold text-2xl tracking-wide hidden sm:block">
                            AUR<span className="text-neon-cyan">A</span>
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        {[
                            { label: 'Cuisine',    href: '#culinary-art' },
                            { label: 'Live Menu',  href: '#menu'         },
                            { label: 'Technology', href: '#robot'        },
                            { label: 'Team',       href: '#team'         },
                        ].map(({ label, href }) => (
                            <a key={label} href={href}
                                className="text-dark-200 hover:text-neon-cyan transition-colors duration-300 relative group">
                                {label}
                                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-neon-cyan group-hover:w-full transition-all duration-300" />
                            </a>
                        ))}
                        <button onClick={handleStaffLogin}
                            className="text-dark-400 hover:text-white transition-colors duration-300">
                            Staff Login
                        </button>
                    </div>
                    <button onClick={() => navigate('/reserve')}
                        className="glass-cyan-btn px-5 py-2.5 rounded-full font-semibold text-sm text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan hover:text-dark-950 transition-all duration-300">
                        Reserve Table
                    </button>
                </div>
            </motion.nav>

            {/* ══════════════════════════════════════════════
                1. HERO — Immersive video background
            ══════════════════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <video autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: 'brightness(0.55) saturate(1.1)' }}>
                    <source src={introVideo} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-dark-950/15 to-dark-950" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-950/35 via-transparent to-dark-950/35" />
                <div className="absolute inset-0 bg-grid opacity-12 pointer-events-none" />
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="hero-scan-line" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-24">
                    {/* Logo orb */}
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-neon-cyan blur-[90px] opacity-20 rounded-full animate-pulse-soft" />
                            <img src={auraLogo} alt="AURA Logo"
                                className="w-36 h-36 md:w-52 md:h-52 object-contain animate-float drop-shadow-[0_0_30px_rgba(0,245,255,0.4)] relative z-10" />
                        </div>
                    </motion.div>

                    {/* AURA badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 backdrop-blur-sm text-neon-cyan text-xs font-bold tracking-[0.2em] uppercase mb-5"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                        Automated Urban Restaurant Assistant
                    </motion.div>

                    {/* "Culinary Masterpieces" gold label */}
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.32, duration: 0.5 }}
                        className="text-gold-400 font-semibold tracking-[0.28em] uppercase text-sm md:text-base mb-3"
                    >
                        Culinary Masterpieces
                    </motion.p>

                    {/* Main headline */}
                    <motion.h1
                        initial={{ y: 48, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.42, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl sm:text-6xl md:text-8xl font-display font-black mb-5 leading-[1.05] tracking-tight"
                    >
                        Crafted to&nbsp;
                        <span
                            style={{
                                background: 'linear-gradient(125deg,#facc15 0%,#f59e0b 55%,#fde68a 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                            className="italic font-light"
                        >Perfection</span>
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        initial={{ y: 28, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.56, duration: 0.65 }}
                        className="text-lg md:text-xl text-dark-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        Every dish is an artform. Every bite, an experience you won&apos;t forget.
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        initial={{ y: 28, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.70, duration: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button onClick={scrollToGallery}
                            className="group relative overflow-hidden font-bold px-9 py-4 rounded-full flex items-center gap-2.5 transition-all duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg,#facc15,#d97706)',
                                boxShadow: '0 0 0 rgba(250,204,21,0)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow='0 0 48px rgba(250,204,21,0.55)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow='0 0 0 rgba(250,204,21,0)'}
                        >
                            <span className="absolute inset-0 bg-white/25 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 skew-x-12" />
                            <span className="text-dark-950">More Details</span>
                            <ChevronDown size={18} className="text-dark-950" />
                        </button>
                        <button onClick={() => navigate('/reserve')}
                            className="glass-hero-btn px-9 py-4 rounded-full flex items-center gap-2.5 font-medium border border-white/20 hover:border-neon-cyan/50 hover:text-neon-cyan text-white/90 transition-all duration-300 backdrop-blur-sm">
                            Reserve a Table <ArrowRight size={18} />
                        </button>
                    </motion.div>
                </div>

                {/* Scroll cue */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={scrollToGallery}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-400 text-xs tracking-widest uppercase select-none"
                >
                    <span>Scroll</span>
                    <ChevronDown size={16} />
                </motion.div>
            </section>

            {/* ══════════════════════════════════════════════
                2. CULINARY ART — Asset food images as CARDS
                (static gallery — no prices, no carousel)
            ══════════════════════════════════════════════ */}
            <section id="culinary-art" ref={gallerySectionRef} className="relative py-24 md:py-32 bg-dark-950 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gold-500/4 blur-[140px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.7 }}
                        className="text-center mb-14"
                    >
                        <p className="text-gold-400 font-bold tracking-[0.25em] uppercase text-sm mb-3">
                            Culinary Art
                        </p>
                        <h2 className="text-4xl md:text-6xl font-display font-black mb-4">
                            Signature{' '}
                            <span style={{
                                background: 'linear-gradient(125deg,#facc15,#f59e0b,#fde68a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>Dishes</span>
                        </h2>
                        <p className="text-dark-300 text-lg max-w-md mx-auto">
                            A showcase of our chef&apos;s finest creations, each a work of art.
                        </p>
                    </motion.div>

                    {/* 3-column gallery card grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {GALLERY_ITEMS.map((item, i) => (
                            <div
                                key={i}
                                className="gallery-card group relative overflow-hidden rounded-3xl border border-white/6 bg-dark-900"
                                data-cursor-hover
                                onMouseMove={onTiltMove}
                                onMouseLeave={onTiltLeave}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={item.img}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                        draggable={false}
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-transparent" />
                                    {/* Category badge top-right */}
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1.5 rounded-full bg-dark-950/80 backdrop-blur-sm border border-neon-cyan/25 text-neon-cyan text-[10px] font-bold tracking-widest uppercase">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                                {/* Name + hover cue */}
                                <div className="p-5 flex items-center justify-between">
                                    <h3 className="text-white font-bold text-base leading-snug">{item.name}</h3>
                                    <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-neon-cyan/50 group-hover:text-neon-cyan transition-all duration-300">
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                                {/* Neon hover border glow */}
                                <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-neon-cyan/18 pointer-events-none transition-all duration-400" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                3. OUR MENU — REAL database items as
                   cinematic parallax CAROUSEL
                   Fields: name, category, imageUrl, emoji
                   price is intentionally NEVER displayed
            ══════════════════════════════════════════════ */}
            <section id="menu" ref={menuSectionRef} className="relative py-24 md:py-32 bg-dark-900 overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
                <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-neon-blue/5 blur-[130px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.7 }}
                        className="text-center mb-12"
                    >
                        <p className="text-neon-cyan font-bold tracking-[0.22em] uppercase text-sm mb-3 flex items-center justify-center gap-2">
                            <span className="w-8 h-px bg-neon-cyan/50" />
                            Our Menu
                            <span className="w-8 h-px bg-neon-cyan/50" />
                        </p>
                        <h2 className="text-4xl md:text-6xl font-display font-black mb-4">
                            Discover Our{' '}
                            <span className="gradient-text">Live Menu</span>
                        </h2>
                        <p className="text-dark-300 text-base max-w-sm mx-auto">
                            Fresh from our kitchen — updated in real time.
                        </p>
                    </motion.div>

                    {/* ── Loading skeleton ── */}
                    {loadingMenu && (
                        <div className="relative overflow-hidden rounded-3xl h-[420px] sm:h-[540px] md:h-[640px] bg-dark-950/60 border border-white/6 flex flex-col items-center justify-center gap-5">
                            <Loader2 size={36} className="text-neon-cyan animate-spin" />
                            <p className="text-dark-400 text-sm tracking-widest uppercase">Loading Live Menu…</p>
                        </div>
                    )}

                    {/* ── Empty state ── */}
                    {!loadingMenu && MENU_TOTAL === 0 && (
                        <div className="relative overflow-hidden rounded-3xl h-64 bg-dark-950/60 border border-white/6 flex items-center justify-center">
                            <p className="text-dark-400 text-sm tracking-wider">Our kitchen is preparing the menu — check back soon.</p>
                        </div>
                    )}

                    {/* ── Real-data parallax carousel ── */}
                    {!loadingMenu && MENU_TOTAL > 0 && (
                        <>
                            <div
                                className="relative overflow-hidden rounded-3xl"
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                                onTouchStart={onTouchStart}
                                onTouchEnd={onTouchEnd}
                            >
                                {/* ── Image/gradient track — parallax on each item ── */}
                                <div
                                    className="flex h-[420px] sm:h-[540px] md:h-[640px]"
                                    style={{
                                        transform: `translateX(-${currentSlide * 100}%)`,
                                        transition: 'transform 0.85s cubic-bezier(0.76,0,0.24,1)',
                                    }}
                                >
                                    {menuItems.map((item, i) => {
                                        const img    = item?.imageUrl ?? null;
                                        const cat    = item?.category ?? '';
                                        const bgSty  = getCategoryStyle(cat);
                                        const offset = i - currentSlide;

                                        return (
                                            <div key={item?.menuItemId ?? i} className="relative min-w-full h-full overflow-hidden">
                                                {img ? (
                                                    <img
                                                        src={img}
                                                        alt={item?.name}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                        style={{
                                                            transform: `translateX(${offset * 15}%) scale(1.18)`,
                                                            transition: 'transform 0.85s cubic-bezier(0.76,0,0.24,1)',
                                                            transformOrigin: 'center',
                                                            willChange: 'transform',
                                                        }}
                                                        draggable={false}
                                                    />
                                                ) : (
                                                    /* Beautiful category gradient when no image */
                                                    <div
                                                        className="absolute inset-0"
                                                        style={{
                                                            ...bgSty,
                                                            transform: `translateX(${offset * 8}%)`,
                                                            transition: 'transform 0.85s cubic-bezier(0.76,0,0.24,1)',
                                                        }}
                                                    >
                                                        {/* Abstract radial decoration */}
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                                            <div className="w-96 h-96 rounded-full border-[40px] border-current" />
                                                        </div>
                                                        <div className="absolute inset-0 flex items-center justify-end pr-16 text-[180px] font-display font-black opacity-8 select-none text-white">
                                                            {item?.emoji || (item?.category ?? '').charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dark overlays */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
                                                <div className="absolute inset-0 bg-gradient-to-r from-dark-950/45 via-transparent to-dark-950/25" />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ── Text overlay — animates per slide ── */}
                                <div
                                    className="absolute inset-0 flex flex-col justify-between p-6 md:p-10"
                                    onMouseMove={onTiltMove}
                                    onMouseLeave={onTiltLeave}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* Top row: category badge + counter */}
                                    <div className="flex items-start justify-between">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={`cat-${currentSlide}`}
                                                initial={{ opacity: 0, x: -22 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -12 }}
                                                transition={{ duration: 0.38, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                                className="px-3.5 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-bold tracking-wider backdrop-blur-sm uppercase"
                                            >
                                                {curCat || 'Specialty'}
                                            </motion.span>
                                        </AnimatePresence>

                                        {/* Prep time badge */}
                                        {curItem?.prepTimeMinutes && (
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={`prep-${currentSlide}`}
                                                    initial={{ opacity: 0, x: 16 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.35, delay: 0.28 }}
                                                    className="px-3 py-1.5 rounded-full bg-dark-950/70 backdrop-blur-sm border border-white/10 text-dark-300 text-xs font-mono"
                                                >
                                                    ⏱ {curItem.prepTimeMinutes} min
                                                </motion.span>
                                            </AnimatePresence>
                                        )}
                                    </div>

                                    {/* Bottom: emoji + dish name + short description */}
                                    <div>
                                        {/* Emoji floater */}
                                        {curEmoji && (
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={`emoji-${currentSlide}`}
                                                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    transition={{ duration: 0.4, delay: 0.18 }}
                                                    className="text-5xl mb-3 select-none"
                                                >
                                                    {curEmoji}
                                                </motion.div>
                                            </AnimatePresence>
                                        )}

                                        {/* Dish name — NO price ever */}
                                        <AnimatePresence mode="wait">
                                            <motion.h3
                                                key={`name-${currentSlide}`}
                                                initial={{ opacity: 0, y: 44, filter: 'blur(8px)' }}
                                                animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
                                                exit={{ opacity: 0, y: -20,   filter: 'blur(4px)' }}
                                                transition={{ duration: 0.52, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                                className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-white leading-tight drop-shadow-2xl"
                                            >
                                                {curName}
                                            </motion.h3>
                                        </AnimatePresence>

                                        {/* Short description */}
                                        {curDesc && (
                                            <AnimatePresence mode="wait">
                                                <motion.p
                                                    key={`desc-${currentSlide}`}
                                                    initial={{ opacity: 0, y: 16 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.4, delay: 0.38 }}
                                                    className="text-dark-200 text-sm md:text-base mt-2 max-w-lg leading-relaxed line-clamp-2"
                                                >
                                                    {curDesc}
                                                </motion.p>
                                            </AnimatePresence>
                                        )}

                                        {/* Accent line */}
                                        <motion.div
                                            key={`line-${currentSlide}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: 72 }}
                                            transition={{ duration: 0.55, delay: 0.42 }}
                                            className="h-0.5 rounded-full mt-4"
                                            style={{ background: 'linear-gradient(90deg,#00f5ff,transparent)' }}
                                        />

                                        {/* Counter inside the slide */}
                                        <div className="mt-3 text-dark-500 text-xs font-mono tracking-[0.18em] tabular-nums select-none">
                                            {String(currentSlide + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(MENU_TOTAL).padStart(2, '0')}
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow buttons */}
                                <button
                                    onClick={() => setCurrentSlide(c => (c - 1 + MENU_TOTAL) % MENU_TOTAL)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full backdrop-blur-sm bg-dark-950/50 border border-white/12 flex items-center justify-center text-white hover:text-neon-cyan hover:border-neon-cyan/40 transition-all duration-300 hover:scale-110 shadow-xl"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setCurrentSlide(c => (c + 1) % MENU_TOTAL)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full backdrop-blur-sm bg-dark-950/50 border border-white/12 flex items-center justify-center text-white hover:text-neon-cyan hover:border-neon-cyan/40 transition-all duration-300 hover:scale-110 shadow-xl"
                                    aria-label="Next slide"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>

                            {/* Progress dots + auto-progress bar */}
                            <div className="flex items-center justify-between mt-5 px-1">
                                {/* Dot indicators (max 10) */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {MENU_TOTAL <= 12
                                        ? menuItems.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentSlide(i)}
                                                className={`rounded-full transition-all duration-500 ${
                                                    i === currentSlide
                                                        ? 'w-10 h-2.5 bg-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.6)]'
                                                        : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/50'
                                                }`}
                                                aria-label={`Go to slide ${i + 1}`}
                                            />
                                        ))
                                        : (
                                            <span className="text-dark-500 text-xs font-mono">
                                                {currentSlide + 1}&nbsp;of&nbsp;{MENU_TOTAL} items
                                            </span>
                                        )
                                    }
                                </div>

                                {/* Auto-advance progress bar */}
                                <div className="flex items-center gap-3">
                                    <div className="w-28 h-px bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            key={currentSlide}
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: isPaused ? 0 : 5.5, ease: 'linear' }}
                                            className="h-full rounded-full"
                                            style={{ background: 'linear-gradient(90deg,#00f5ff,#4c6ef5)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                4. ROBOT — GSAP staggered feature cards
            ══════════════════════════════════════════════ */}
            <section id="robot" className="relative py-24 md:py-36 overflow-hidden bg-dark-950">
                <div className="absolute inset-0 bg-grid opacity-12 pointer-events-none" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-blue/6 blur-[110px] rounded-full pointer-events-none" />
                <div className="absolute right-0 top-1/4 w-[380px] h-[380px] bg-neon-cyan/4 blur-[90px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}
                        className="text-center mb-16"
                    >
                        <p className="text-neon-cyan font-bold tracking-[0.22em] uppercase text-sm mb-3 flex items-center justify-center gap-2">
                            <span className="w-8 h-px bg-neon-cyan/50" />
                            Powered by AI &amp; Robotics
                            <span className="w-8 h-px bg-neon-cyan/50" />
                        </p>
                        <h2 className="text-4xl md:text-6xl font-display font-black leading-tight">
                            Meet the <span className="gradient-text">AURA Robot</span>
                        </h2>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">
                        {/* Portrait video */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                            className="flex justify-center"
                        >
                            <div className="robot-video-wrapper relative">
                                <div className="absolute -inset-4 rounded-[2.8rem] bg-gradient-to-b from-neon-cyan/25 via-neon-blue/15 to-neon-cyan/25 blur-lg animate-pulse-soft pointer-events-none" />
                                {['-top-1.5 -left-1.5 border-t-2 border-l-2 rounded-tl-xl',
                                  '-top-1.5 -right-1.5 border-t-2 border-r-2 rounded-tr-xl',
                                  '-bottom-1.5 -left-1.5 border-b-2 border-l-2 rounded-bl-xl',
                                  '-bottom-1.5 -right-1.5 border-b-2 border-r-2 rounded-br-xl',
                                ].map((cls, i) => (
                                    <div key={i} className={`absolute w-6 h-6 border-neon-cyan z-10 ${cls}`} />
                                ))}
                                <div
                                    className="relative w-[272px] md:w-[308px] rounded-[2.2rem] overflow-hidden border border-neon-cyan/20 shadow-[0_0_70px_rgba(0,245,255,0.14),0_0_140px_rgba(76,110,245,0.07)]"
                                    style={{ aspectRatio: '9/16' }}
                                >
                                    <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                                        <source src={robotVideo} type="video/mp4" />
                                    </video>
                                    {/* CRT scanlines */}
                                    <div className="absolute inset-0 pointer-events-none"
                                        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)' }} />
                                    {/* Top HUD */}
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
                            </div>
                        </motion.div>

                        {/* GSAP-animated feature cards */}
                        <div ref={featuresRef} className="space-y-3.5">
                            {ROBOT_FEATURES.map((f, i) => {
                                const Icon = f.Icon;
                                return (
                                    <div key={i}
                                        className={`robot-feature-card glass rounded-2xl p-5 border ${f.borderClass} ${f.bgClass} flex items-start gap-4 cursor-default`}>
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl border ${f.borderClass} flex items-center justify-center`}>
                                            <Icon size={18} className={f.colorClass} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-base mb-1">{f.title}</h4>
                                            <p className="text-dark-300 text-sm leading-relaxed">{f.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                5. MEET THE TEAM — GSAP parallax mosaic
            ══════════════════════════════════════════════ */}
            <section id="team" ref={teamSectionRef} className="relative py-24 md:py-36 overflow-hidden bg-dark-900">
                {/* Parallax mosaic background */}
                <div ref={teamBgRef} className="absolute inset-[-18%] pointer-events-none">
                    <div className="w-full h-full" style={{
                        backgroundImage: `url(${madhushanPhoto}),url(${dissanayakePhoto}),url(${amarangaPhoto}),url(${thennakoonPhoto})`,
                        backgroundSize: '25% auto',
                        backgroundPosition: '0% 50%,25% 50%,50% 50%,75% 50%',
                        backgroundRepeat: 'no-repeat',
                        filter: 'blur(3px) grayscale(100%)',
                        opacity: 0.055,
                    }} />
                    <div className="absolute inset-0 bg-dark-900/93" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-neon-blue/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.7 }}
                        className="text-center mb-16"
                    >
                        <p className="text-neon-cyan font-bold tracking-[0.25em] uppercase text-sm mb-3">The Builders</p>
                        <h2 className="text-4xl md:text-6xl font-display font-black mb-4">
                            Meet the{' '}
                            <span style={{
                                background: 'linear-gradient(125deg,#facc15,#f59e0b,#fde68a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>Team</span>
                        </h2>
                        <p className="text-dark-300 text-lg max-w-lg mx-auto leading-relaxed">
                            3rd-year Computer Engineering undergraduates,<br className="hidden sm:block" /> University of Peradeniya.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TEAM_MEMBERS.map((member, i) => (
                            <div key={i} className="team-member-card-gsap group glass rounded-2xl overflow-hidden border border-white/5 cursor-default relative">
                                <div className="relative h-60 overflow-hidden">
                                    <img src={member.photo} alt={member.name}
                                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/10 to-transparent" />
                                    <div className="absolute top-3 right-3 bg-dark-950/75 backdrop-blur-sm px-2.5 py-1 rounded-full border border-neon-cyan/20">
                                        <span className="text-neon-cyan text-[10px] font-mono tracking-wider">{member.id}</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-white font-bold text-sm leading-snug mb-2">{member.name}</h3>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-800 border border-white/10 text-dark-300 text-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                                        Team Member
                                    </div>
                                </div>
                                <div className="absolute inset-0 border border-transparent group-hover:border-neon-cyan/20 rounded-2xl transition-all duration-400 pointer-events-none" />
                            </div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }}
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
                6. FOOTER
            ══════════════════════════════════════════════ */}
            <footer className="relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${footerImage})`, filter: 'brightness(0.40) saturate(0.8)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/88 to-dark-950/52" />
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

                {/* CTA banner */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className="text-neon-cyan font-bold tracking-[0.22em] uppercase text-sm mb-3 flex items-center justify-center gap-2">
                            <span className="w-8 h-px bg-neon-cyan/50" />Experience the Future<span className="w-8 h-px bg-neon-cyan/50" />
                        </p>
                        <h2 className="text-4xl md:text-6xl font-display font-black mb-5">Ready for the Future?</h2>
                        <p className="text-dark-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                            Secure your table and experience the ultimate fusion of gourmet dining and autonomous robotics.
                        </p>
                        <button onClick={() => navigate('/reserve')}
                            className="group relative overflow-hidden font-bold px-10 py-4 rounded-full inline-flex items-center gap-2.5 transition-all duration-300 hover:scale-105"
                            style={{ background: 'linear-gradient(135deg,#facc15,#d97706)' }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow='0 0 48px rgba(250,204,21,0.55)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                        >
                            <span className="absolute inset-0 bg-white/25 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 skew-x-12" />
                            <span className="text-dark-950">Reserve Your Table</span>
                            <ArrowRight size={20} className="text-dark-950" />
                        </button>
                    </motion.div>
                </div>

                {/* Footer body */}
                <div className="relative z-10 border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                            {/* Brand */}
                            <div className="flex flex-col items-start gap-3">
                                <div className="flex items-center gap-2">
                                    <img src={auraLogo} alt="AURA" className="h-8 w-auto object-contain drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]" />
                                    <span className="font-display font-bold text-xl">AUR<span className="text-neon-cyan">A</span></span>
                                </div>
                                <p className="text-dark-400 text-sm leading-relaxed">
                                    Automated Urban Restaurant Assistant —<br />where technology meets taste.
                                </p>
                                <div className="flex items-center gap-2.5 mt-1">
                                    {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                        <a key={i} href="#" aria-label="Social"
                                            className="p-2 rounded-full border border-white/10 text-dark-400 hover:text-neon-cyan hover:border-neon-cyan/35 transition-all duration-300">
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
                                        { label: 'Signature Dishes', href: '#culinary-art' },
                                        { label: 'Live Menu',        href: '#menu'         },
                                        { label: 'AURA Technology',  href: '#robot'        },
                                        { label: 'Meet the Team',    href: '#team'         },
                                    ].map((link) => (
                                        <li key={link.label}>
                                            <a href={link.href} className="text-dark-400 hover:text-neon-cyan transition-colors text-sm flex items-center gap-1.5 group">
                                                <ArrowRight size={11} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact — exact per requirement */}
                            <div>
                                <h4 className="text-white font-semibold text-xs mb-5 tracking-[0.18em] uppercase">Contact</h4>
                                <ul className="space-y-3.5">
                                    {[
                                        { Icon: MapPin, text: 'University of Peradeniya, Sri Lanka' },
                                        { Icon: Mail,   text: 'pdnprojectaura17@gmail.com'         },
                                        { Icon: Phone,  text: '0760609159'                         },
                                    ].map(({ Icon, text }, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-dark-400 text-sm">
                                            <Icon size={13} className="mt-0.5 flex-shrink-0 text-neon-cyan" />
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

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
