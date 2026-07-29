/**
 * ============================================================
 *  AURA Restaurant System — Analytics Page
 * ============================================================
 *  Shows live stats from /api/admin/stats and /api/admin/revenue,
 *  plus order breakdowns computed from RestaurantContext.
 *  ⚠️  ALL backend logic is IDENTICAL to the original.
 *      Only the visual layer has been updated.
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, DollarSign, ShoppingBag, Clock,
    TrendingUp, RefreshCw, AlertCircle, Loader2,
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Footer  from '../../components/layout/Footer';
import { formatPrice } from '../../utils/helpers';
import { useRestaurant } from '../../context/RestaurantContext';
import { getAdminStats, getRevenue } from '../../api/adminAPI';

/* ── Gradient colour tokens per stat ── */
const STAT_CONFIGS = [
    {
        key: 'confirmedRevenue', label: 'Confirmed Revenue',
        icon: DollarSign,
        gradient: 'linear-gradient(135deg,#10b981,#34d399)',
        glow: 'rgba(16,185,129,0.25)',
        border: 'rgba(16,185,129,0.25)',
    },
    {
        key: 'pendingRevenue', label: 'Pending Revenue',
        icon: ShoppingBag,
        gradient: 'linear-gradient(135deg,#00f5ff,#4c6ef5)',
        glow: 'rgba(0,245,255,0.22)',
        border: 'rgba(0,245,255,0.2)',
    },
    {
        key: 'activeOrders', label: 'Active Orders',
        icon: ShoppingBag,
        gradient: 'linear-gradient(135deg,#f59e0b,#facc15)',
        glow: 'rgba(245,158,11,0.25)',
        border: 'rgba(245,158,11,0.2)',
    },
    {
        key: 'avgDeliveryMins', label: 'Avg Delivery Time',
        icon: Clock,
        gradient: 'linear-gradient(135deg,#a855f7,#ec4899)',
        glow: 'rgba(168,85,247,0.22)',
        border: 'rgba(168,85,247,0.2)',
    },
];

export default function AnalyticsPage() {
    /* ── ALL state and logic UNCHANGED ── */
    const { activeOrders, orderHistory } = useRestaurant();

    const [stats,          setStats]          = useState(null);
    const [pendingRevenue, setPendingRevenue] = useState(null);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState('');
    const [lastUpdated,    setLastUpdated]    = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [statsData, pendingData] = await Promise.all([
                getAdminStats(),
                getRevenue('pending'),
            ]);
            setStats(statsData);
            setPendingRevenue(pendingData);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load analytics data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, []);

    /* ── Order status breakdown (unchanged) ── */
    const allOrders = [...activeOrders, ...orderHistory]
        .filter((o, idx, arr) => arr.findIndex((x) => x.id === o.id) === idx);

    const statusCounts = allOrders.reduce((acc, order) => {
        const key = (order.status || 'unknown').toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    /* ── Top items (unchanged) ── */
    const itemCounts = {};
    allOrders.forEach((order) => {
        (order.items || []).forEach((item) => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 0);
        });
    });
    const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    /* ── Build stat card values ── */
    const statValues = stats ? {
        confirmedRevenue: formatPrice(stats.confirmedRevenue),
        pendingRevenue:   formatPrice(pendingRevenue?.total ?? 0),
        activeOrders:     String(stats.activeOrders),
        avgDeliveryMins:  stats.avgDeliveryMins > 0 ? `${stats.avgDeliveryMins} min` : '—',
    } : {};

    /* ── Status bar colour map ── */
    const statusColor = (status) => {
        if (/complet|deliver|paid/.test(status))  return 'linear-gradient(90deg,#10b981,#34d399)';
        if (/pending|new|placed/.test(status))    return 'linear-gradient(90deg,#facc15,#f59e0b)';
        if (/cancel|reject|fail/.test(status))    return 'linear-gradient(90deg,#ef4444,#f87171)';
        if (/prepar|cooking|progress/.test(status)) return 'linear-gradient(90deg,#00f5ff,#4c6ef5)';
        return 'linear-gradient(90deg,#6b7280,#9ca3af)';
    };

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

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-neon-cyan text-[10px] font-bold tracking-[0.22em] uppercase mb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                                Live Dashboard
                            </p>
                            <h1 className="font-display text-3xl font-black text-white flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                                    <BarChart3 size={18} className="text-neon-cyan" />
                                </div>
                                Analytics
                            </h1>
                            <p className="text-dark-400 mt-1 text-sm">
                                Restaurant performance overview
                                {lastUpdated && (
                                    <span className="text-dark-600 font-mono ml-1.5">
                                        · Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </p>
                        </div>

                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/6 hover:border-neon-cyan/25 text-dark-300 hover:text-white text-sm transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin text-neon-cyan' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-6 lg:px-8 space-y-6 pb-8">

                    {/* Error banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400"
                            >
                                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Stat Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {loading && !stats
                            ? STAT_CONFIGS.map((_, i) => (
                                <div key={i} className="h-32 rounded-2xl bg-dark-800/40 border border-white/4 animate-pulse" />
                            ))
                            : STAT_CONFIGS.map((cfg, i) => {
                                const Icon = cfg.icon;
                                return (
                                    <motion.div
                                        key={cfg.key}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07, duration: 0.45 }}
                                        className="relative overflow-hidden glass rounded-2xl p-5 border"
                                        style={{ borderColor: cfg.border }}
                                    >
                                        {/* Icon badge */}
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg mb-4"
                                            style={{ background: cfg.gradient, boxShadow: `0 0 20px ${cfg.glow}` }}>
                                            <Icon size={20} className="text-white" />
                                        </div>
                                        <p className="text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">{cfg.label}</p>
                                        <p className="text-3xl font-black text-white font-display leading-none">
                                            {statValues[cfg.key] ?? '—'}
                                        </p>
                                        {/* Decorative glow disc */}
                                        <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
                                            style={{ background: cfg.gradient }} />
                                    </motion.div>
                                );
                            })
                        }
                    </div>

                    {/* ── Charts row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Order Status Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="glass rounded-2xl overflow-hidden border border-white/7"
                        >
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                                    <ShoppingBag size={13} className="text-neon-cyan" />
                                </div>
                                <h2 className="font-display text-base font-bold text-white">Order Status Breakdown</h2>
                                <span className="ml-auto text-xs text-dark-500 font-mono">{allOrders.length} total</span>
                            </div>
                            <div className="p-6 space-y-4">
                                {Object.keys(statusCounts).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        {loading
                                            ? <Loader2 size={24} className="text-neon-cyan animate-spin" />
                                            : <p className="text-sm text-dark-500">No orders yet.</p>
                                        }
                                    </div>
                                ) : (
                                    Object.entries(statusCounts).map(([status, count]) => {
                                        const pct = Math.round((count / allOrders.length) * 100);
                                        return (
                                            <div key={status}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-white capitalize font-medium">{status}</span>
                                                    <span className="text-xs text-dark-400 font-mono">{count} <span className="text-dark-600">({pct}%)</span></span>
                                                </div>
                                                <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                                                        className="h-full rounded-full"
                                                        style={{ background: statusColor(status) }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>

                        {/* Top Selling Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.38, duration: 0.5 }}
                            className="glass rounded-2xl overflow-hidden border border-white/7"
                        >
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp size={13} className="text-emerald-400" />
                                </div>
                                <h2 className="font-display text-base font-bold text-white">Top Selling Items</h2>
                            </div>
                            <div className="p-6 space-y-3">
                                {topItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        {loading
                                            ? <Loader2 size={24} className="text-neon-cyan animate-spin" />
                                            : <p className="text-sm text-dark-500">No order data yet.</p>
                                        }
                                    </div>
                                ) : (
                                    topItems.map(([name, qty], idx) => {
                                        const maxQty = topItems[0][1];
                                        const pct    = Math.round((qty / maxQty) * 100);
                                        const medals = ['🥇', '🥈', '🥉'];
                                        return (
                                            <motion.div
                                                key={name}
                                                initial={{ opacity: 0, x: 16 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.42 + idx * 0.05 }}
                                                className="flex items-center gap-3.5"
                                            >
                                                {/* Rank */}
                                                <div className="w-7 h-7 rounded-lg bg-dark-800 border border-white/6 flex items-center justify-center text-xs font-bold text-dark-300 flex-shrink-0">
                                                    {medals[idx] ?? `#${idx + 1}`}
                                                </div>
                                                {/* Name + bar */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-white font-medium truncate">{name}</span>
                                                        <span className="text-xs font-bold text-neon-cyan ml-2 flex-shrink-0">{qty} sold</span>
                                                    </div>
                                                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.65, delay: 0.5 + idx * 0.06, ease: 'easeOut' }}
                                                            className="h-full rounded-full"
                                                            style={{ background: 'linear-gradient(90deg,#00f5ff,#4c6ef5)' }}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}