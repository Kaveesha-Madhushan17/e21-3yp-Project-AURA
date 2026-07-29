/**
 * ============================================================
 *  AURA Restaurant System — Inventory Page
 * ============================================================
 *  Stock levels and ingredient tracking (preview data).
 *  ⚠️  ALL data and logic is IDENTICAL to the original.
 *      Only the visual layer has been updated.
 * ============================================================
 */

import { motion } from 'framer-motion';
import { Package, AlertCircle, TrendingDown } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Footer  from '../../components/layout/Footer';

/* ── ALL placeholder data UNCHANGED ── */
const PLACEHOLDER_ITEMS = [
    { name: 'Rice (Samba)', unit: 'kg', stock: 45, min: 10, gradient: 'linear-gradient(135deg,#10b981,#34d399)', glow: 'rgba(16,185,129,0.25)'   },
    { name: 'Chicken',      unit: 'kg', stock: 12, min: 15, gradient: 'linear-gradient(135deg,#ef4444,#f87171)', glow: 'rgba(239,68,68,0.25)'     },
    { name: 'Vegetables',   unit: 'kg', stock: 8,  min: 10, gradient: 'linear-gradient(135deg,#f59e0b,#facc15)', glow: 'rgba(245,158,11,0.25)'    },
    { name: 'Coconut Oil',  unit: 'L',  stock: 20, min: 5,  gradient: 'linear-gradient(135deg,#00f5ff,#4c6ef5)', glow: 'rgba(0,245,255,0.22)'     },
    { name: 'Flour',        unit: 'kg', stock: 30, min: 10, gradient: 'linear-gradient(135deg,#a855f7,#ec4899)', glow: 'rgba(168,85,247,0.22)'    },
    { name: 'Sugar',        unit: 'kg', stock: 25, min: 8,  gradient: 'linear-gradient(135deg,#f43f5e,#fb7185)', glow: 'rgba(244,63,94,0.22)'     },
];

export default function InventoryPage() {
    const lowCount = PLACEHOLDER_ITEMS.filter(i => i.stock < i.min).length;

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
                                Kitchen Operations
                            </p>
                            <h1 className="font-display text-3xl font-black text-white flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                                    <Package size={18} className="text-neon-cyan" />
                                </div>
                                Inventory
                            </h1>
                            <p className="text-dark-400 mt-1 text-sm">Stock levels and ingredient tracking</p>
                        </div>

                        {/* Summary badges */}
                        <div className="flex items-center gap-2.5">
                            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                                Preview Data
                            </span>
                            {lowCount > 0 && (
                                <span className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5">
                                    <TrendingDown size={12} />
                                    {lowCount} Low
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-6 lg:px-8 pb-8 space-y-5">

                    {/* Info banner */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-400"
                    >
                        <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                        Inventory tracking backend is coming soon. Showing sample data.
                    </motion.div>

                    {/* Inventory grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PLACEHOLDER_ITEMS.map((item, idx) => {
                            /* percentage logic UNCHANGED */
                            const pct = Math.min(100, Math.round((item.stock / (item.min * 3)) * 100));
                            const low = item.stock < item.min;

                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.07, duration: 0.4 }}
                                    className="glass rounded-2xl p-5 border border-white/7 flex flex-col gap-4 relative overflow-hidden hover:border-white/12 transition-all duration-300"
                                >
                                    {/* Glow disc */}
                                    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-15 pointer-events-none"
                                        style={{ background: item.gradient }} />

                                    {/* Icon + low badge */}
                                    <div className="flex items-start justify-between">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                                            style={{ background: item.gradient, boxShadow: `0 0 18px ${item.glow}` }}>
                                            <Package size={18} className="text-white" />
                                        </div>
                                        {low && (
                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-[10px] font-bold uppercase tracking-wide">
                                                <TrendingDown size={10} /> Low
                                            </span>
                                        )}
                                    </div>

                                    {/* Item name + min */}
                                    <div>
                                        <p className="font-bold text-white text-sm leading-snug">{item.name}</p>
                                        <p className="text-xs text-dark-500 mt-0.5 font-mono">Minimum: {item.min} {item.unit}</p>
                                    </div>

                                    {/* Stock bar */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] text-dark-400 uppercase tracking-wide font-semibold">In Stock</span>
                                            <span className={`text-sm font-black font-mono ${low ? 'text-red-400' : 'text-white'}`}>
                                                {item.stock} {item.unit}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, delay: 0.15 + idx * 0.07, ease: 'easeOut' }}
                                                className="h-full rounded-full"
                                                style={{ background: low ? 'linear-gradient(90deg,#ef4444,#f87171)' : item.gradient }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-dark-600 font-mono">0</span>
                                            <span className="text-[10px] text-dark-600 font-mono">{pct}%</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}
