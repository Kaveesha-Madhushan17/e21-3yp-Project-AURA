import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Star, Clock, Utensils, ArrowRight } from 'lucide-react';
import { menuAPI } from '../../api/menuAPI';
import auraLogo from '../../assets/aura_logo.png';

/**
 * ============================================================
 *  Landing Page
 * ============================================================
 *  Public-facing customer page with premium animations,
 *  featuring the AURA robotic dining experience.
 * ============================================================
 */
export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [loadingMenu, setLoadingMenu] = useState(true);

    // Track scroll for sticky nav styling
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch active menu items
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const items = await menuAPI.getAvailableItems();
                setMenuItems(items);
            } catch (err) {
                console.error("Failed to load menu", err);
            } finally {
                setLoadingMenu(false);
            }
        };
        fetchMenu();
    }, []);

    const categories = ['ALL', ...new Set(menuItems.map(item => item.category))];
    const filteredMenu = activeCategory === 'ALL' 
        ? menuItems 
        : menuItems.filter(item => item.category === activeCategory);

    return (
        <div className="min-h-screen bg-dark-950 text-dark-50 font-sans selection:bg-neon-blue selection:text-white">
            
            {/* ─── STICKY NAVIGATION ─── */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                    scrolled ? 'glass-light py-3 border-b border-white/5' : 'bg-transparent py-5'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={auraLogo} alt="AURA" className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]" />
                        <span className="font-display font-bold text-2xl tracking-wide hidden sm:block">
                            AUR<span className="text-neon-cyan">A</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <a href="#about" className="hover:text-neon-cyan transition-colors">Experience</a>
                        <a href="#menu" className="hover:text-neon-cyan transition-colors">Menu</a>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('aura_token');
                                localStorage.removeItem('aura_session');
                                window.location.href = '/login';
                            }}
                            className="text-dark-300 hover:text-white transition-colors"
                        >
                            Staff Login
                        </button>
                    </div>

                    <button 
                        onClick={() => navigate('/reserve')}
                        className="btn-glow bg-neon-blue/20 border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white px-6 py-2 rounded-full font-medium transition-all text-sm shadow-[0_0_15px_rgba(76,110,245,0.3)]"
                    >
                        Reserve Table
                    </button>
                </div>
            </motion.nav>

            {/* ─── HERO SECTION ─── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-animated">
                {/* Overlay grid */}
                <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
                
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-20">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-neon-cyan blur-[60px] opacity-20 rounded-full animate-pulse-soft" />
                            <img src={auraLogo} alt="AURA Logo" className="w-48 h-48 md:w-64 md:h-64 object-contain animate-float drop-shadow-2xl relative z-10" />
                        </div>
                    </motion.div>

                    <motion.h1 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
                    >
                        The Future of <br/>
                        <span className="text-gradient-gold italic font-light">Fine Dining</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-lg md:text-xl text-dark-200 mb-10 max-w-2xl mx-auto font-light"
                    >
                        Experience culinary excellence delivered with robotic precision. A seamless blend of gourmet artistry and cutting-edge automation.
                    </motion.p>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button 
                            onClick={() => navigate('/reserve')}
                            className="bg-gradient-to-r from-gold-500 to-gold-600 text-dark-950 font-bold px-8 py-4 rounded-full flex items-center gap-2 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all hover:scale-105"
                        >
                            <Calendar size={20} />
                            Book Your Experience
                        </button>
                        <a 
                            href="#menu"
                            className="glass px-8 py-4 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors"
                        >
                            <Utensils size={20} />
                            Explore Menu
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ─── ABOUT / EXPERIENCE SECTION ─── */}
            <section id="about" className="landing-section bg-dark-900 border-y border-white/5 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7 }}
                        >
                            <h2 className="text-sm font-bold tracking-[0.2em] text-neon-cyan uppercase mb-3">The AURA Advantage</h2>
                            <h3 className="text-4xl md:text-5xl font-display font-bold mb-6">Where Technology Meets Taste</h3>
                            <p className="text-dark-200 text-lg leading-relaxed mb-8">
                                AURA is not just a restaurant; it's a symphony of flavors and robotics. 
                                Our fully autonomous service ensures your meals arrive fresh, hot, and exactly as ordered, 
                                minimizing wait times and maximizing your dining pleasure.
                            </p>
                            
                            <div className="space-y-6">
                                {[
                                    { icon: <Star className="text-gold-400"/>, title: "Precision Delivery", desc: "Our robots navigate with millimeter accuracy." },
                                    { icon: <Clock className="text-neon-cyan"/>, title: "Zero Wait Time", desc: "Instant kitchen-to-table routing." }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="glass-light p-3 rounded-xl">{feature.icon}</div>
                                        <div>
                                            <h4 className="text-white font-semibold text-lg">{feature.title}</h4>
                                            <p className="text-dark-300">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="relative h-[500px] rounded-3xl overflow-hidden glass border-white/10"
                        >
                            {/* Placeholder for a nice lifestyle image or video of the robot */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-neon-blue/20 to-transparent mix-blend-overlay z-10"/>
                            <div className="absolute inset-0 bg-dark-800 flex items-center justify-center">
                                <img src={auraLogo} alt="AURA Robot" className="w-1/2 opacity-50 grayscale" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── LIVE MENU SECTION ─── */}
            <section id="menu" className="landing-section bg-dark-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-sm font-bold tracking-[0.2em] text-gold-400 uppercase mb-3">Culinary Art</h2>
                        <h3 className="text-4xl md:text-5xl font-display font-bold">Discover Our Menu</h3>
                    </motion.div>

                    {/* Category Tabs */}
                    <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-6 mb-8 justify-start md:justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all duration-300 ${
                                    activeCategory === cat 
                                    ? 'bg-white text-dark-950 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                    : 'glass text-dark-200 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Menu Grid */}
                    {loadingMenu ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"/>
                        </div>
                    ) : (
                        <motion.div 
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence>
                                {filteredMenu.slice(0, 6).map((item) => (
                                    <motion.div
                                        key={item.menuItemId ?? item.id ?? item.name}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        className="glass rounded-2xl overflow-hidden group hover:border-neon-cyan/50 transition-colors"
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
                                            <div className="absolute top-4 right-4 bg-dark-950/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-white border border-white/10">
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

            {/* ─── CTA FOOTER SECTION ─── */}
            <section className="relative py-24 bg-dark-900 border-t border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-neon-blue/5 blur-[100px]" />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready for the Future?</h2>
                    <p className="text-dark-200 text-lg mb-10 max-w-2xl mx-auto">
                        Secure your table now and be among the first to experience the ultimate fusion of gourmet dining and autonomous robotics.
                    </p>
                    <button 
                        onClick={() => navigate('/reserve')}
                        className="bg-white text-dark-950 font-bold px-10 py-4 rounded-full inline-flex items-center gap-2 hover:bg-neon-cyan hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] transition-all hover:scale-105"
                    >
                        Reserve Your Table
                        <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="border-t border-white/5 bg-dark-950 py-8 text-center text-dark-400 text-sm">
                <p>&copy; {new Date().getFullYear()} AURA Restaurant System. All rights reserved.</p>
            </footer>
        </div>
    );
}
