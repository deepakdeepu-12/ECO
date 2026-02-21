import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Wind, Droplets, TreeDeciduous, Recycle, Zap, TrendingUp,
    Globe, Award, Leaf,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from 'recharts';

// ── Mock data ──────────────────────────────────────────────────────────────
const WEEKLY_CO2 = [
    { day: 'Mon', saved: 1.2, target: 2 },
    { day: 'Tue', saved: 2.1, target: 2 },
    { day: 'Wed', saved: 1.8, target: 2 },
    { day: 'Thu', saved: 2.8, target: 2 },
    { day: 'Fri', saved: 1.5, target: 2 },
    { day: 'Sat', saved: 3.1, target: 2 },
    { day: 'Sun', saved: 2.4, target: 2 },
];

const MONTHLY_RECYCLED = [
    { month: 'Sep', kg: 12 }, { month: 'Oct', kg: 18 },
    { month: 'Nov', kg: 22 }, { month: 'Dec', kg: 15 },
    { month: 'Jan', kg: 28 }, { month: 'Feb', kg: 24 },
];

const WASTE_BREAKDOWN = [
    { name: 'Plastic', value: 38, color: '#3B82F6' },
    { name: 'Paper', value: 27, color: '#10B981' },
    { name: 'Glass', value: 18, color: '#8B5CF6' },
    { name: 'Metal', value: 10, color: '#F59E0B' },
    { name: 'Organic', value: 7, color: '#EF4444' },
];

const MILESTONES = [
    { label: 'First Scan', emoji: '📱', done: true },
    { label: '10 Items Recycled', emoji: '♻️', done: true },
    { label: '5 kg CO₂ Saved', emoji: '🌿', done: true },
    { label: '50 Items Recycled', emoji: '🏅', done: true },
    { label: 'Plant a Tree', emoji: '🌳', done: false },
    { label: '100 kg CO₂ Saved', emoji: '🌍', done: false },
];

type Period = 'week' | 'month';
type Tab = 'overview' | 'trends' | 'breakdown' | 'milestones';

interface ImpactDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    carbonSaved?: number;
    itemsRecycled?: number;
}

// ── Custom tooltip ─────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs shadow-xl">
            <p className="text-gray-400 mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {p.value} {p.name === 'saved' || p.name === 'CO₂ Saved' ? 'kg' : p.name === 'target' ? 'kg' : 'kg'}
                </p>
            ))}
        </div>
    );
};

export function ImpactDashboard({ isOpen, onClose, carbonSaved = 48.9, itemsRecycled = 142 }: ImpactDashboardProps) {
    const [tab, setTab] = useState<Tab>('overview');
    const [period, setPeriod] = useState<Period>('week');

    // Derived stats
    const treesEquivalent = (carbonSaved / 21).toFixed(1);
    const waterSaved = (itemsRecycled * 3.5).toFixed(0);
    const energySaved = (carbonSaved * 1.4).toFixed(1);
    const communityRank = 84; // top N%

    if (!isOpen) return null;

    const STAT_CARDS = [
        { icon: Wind, label: 'CO₂ Saved', value: `${carbonSaved} kg`, sub: 'lifetime', color: '#10B981', bg: 'from-green-500/20 to-emerald-600/10' },
        { icon: TreeDeciduous, label: 'Trees Equivalent', value: `${treesEquivalent}`, sub: 'trees planted eq.', color: '#34D399', bg: 'from-teal-500/20 to-green-600/10' },
        { icon: Recycle, label: 'Items Recycled', value: `${itemsRecycled}`, sub: 'total items', color: '#3B82F6', bg: 'from-blue-500/20 to-cyan-600/10' },
        { icon: Droplets, label: 'Water Saved', value: `${waterSaved} L`, sub: 'estimated', color: '#06B6D4', bg: 'from-cyan-500/20 to-blue-600/10' },
        { icon: Zap, label: 'Energy Saved', value: `${energySaved} kWh`, sub: 'equivalent', color: '#F59E0B', bg: 'from-yellow-500/20 to-orange-600/10' },
        { icon: TrendingUp, label: 'Community Rank', value: `Top ${communityRank}%`, sub: 'in your area', color: '#8B5CF6', bg: 'from-purple-500/20 to-pink-600/10' },
    ];

    const TABS: { id: Tab; label: string }[] = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'trends', label: '📈 Trends' },
        { id: 'breakdown', label: '🥧 Breakdown' },
        { id: 'milestones', label: '🏆 Milestones' },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden w-full shadow-2xl flex flex-col"
                    style={{ maxWidth: 560, height: '90vh' }}
                >
                    {/* ── Header ── */}
                    <div className="flex-shrink-0 bg-gradient-to-br from-orange-900/40 to-red-900/20 border-b border-gray-800 px-5 pt-4 pb-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg leading-none">Impact Dashboard</h2>
                                    <p className="text-gray-400 text-xs mt-0.5">Your contribution to a cleaner planet</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-9 h-9 bg-gray-800/60 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 overflow-x-auto pb-0" style={{ scrollbarWidth: 'none' }}>
                            {TABS.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`flex-shrink-0 px-3 py-2.5 text-xs font-semibold transition-all rounded-t-xl ${tab === t.id
                                        ? 'bg-gray-900 text-orange-400 border-t border-x border-gray-700'
                                        : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">

                        {/* ── OVERVIEW ── */}
                        {tab === 'overview' && (
                            <>
                                {/* Global impact banner */}
                                <div className="bg-gradient-to-r from-green-900/40 to-teal-900/30 border border-green-700/30 rounded-2xl p-4 flex items-center gap-3">
                                    <Leaf className="w-8 h-8 text-green-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-green-300 font-semibold text-sm">You're making a real difference!</p>
                                        <p className="text-gray-400 text-xs mt-0.5">Your recycling has prevented {carbonSaved} kg of CO₂ — equivalent to driving {(carbonSaved * 4).toFixed(0)} km less by car.</p>
                                    </div>
                                </div>

                                {/* Stat cards grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {STAT_CARDS.map((s, i) => (
                                        <motion.div
                                            key={s.label}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className={`bg-gradient-to-br ${s.bg} border border-gray-700/50 rounded-2xl p-4`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <s.icon className="w-4 h-4 flex-shrink-0" style={{ color: s.color }} />
                                                <span className="text-gray-400 text-xs">{s.label}</span>
                                            </div>
                                            <p className="text-white font-black text-xl leading-none">{s.value}</p>
                                            <p className="text-gray-500 text-xs mt-1">{s.sub}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Mini weekly area chart */}
                                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
                                    <p className="text-white font-semibold text-sm mb-3">CO₂ Saved This Week</p>
                                    <ResponsiveContainer width="100%" height={100}>
                                        <AreaChart data={WEEKLY_CO2} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="co2grad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} />
                                            <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Area type="monotone" dataKey="saved" name="saved" stroke="#10B981" strokeWidth={2} fill="url(#co2grad)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        )}

                        {/* ── TRENDS ── */}
                        {tab === 'trends' && (
                            <>
                                {/* Period toggle */}
                                <div className="flex bg-gray-800/60 rounded-2xl p-1 gap-1">
                                    {(['week', 'month'] as Period[]).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPeriod(p)}
                                            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${period === p ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {p === 'week' ? 'This Week' : 'Last 6 Months'}
                                        </button>
                                    ))}
                                </div>

                                {/* CO₂ chart */}
                                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
                                    <p className="text-white font-semibold text-sm mb-1">CO₂ Saved (kg)</p>
                                    <p className="text-gray-500 text-xs mb-3">{period === 'week' ? 'Daily vs 2 kg target' : 'Monthly totals'}</p>
                                    <ResponsiveContainer width="100%" height={150}>
                                        {period === 'week' ? (
                                            <AreaChart data={WEEKLY_CO2} margin={{ top: 5, right: 0, left: -28, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} />
                                                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Area type="monotone" dataKey="saved" name="CO₂ Saved" stroke="#F97316" strokeWidth={2} fill="url(#grad1)" />
                                                <Area type="monotone" dataKey="target" name="target" stroke="#374151" strokeWidth={1} fill="none" strokeDasharray="5 5" />
                                            </AreaChart>
                                        ) : (
                                            <BarChart data={MONTHLY_RECYCLED} margin={{ top: 5, right: 0, left: -28, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10 }} />
                                                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Bar dataKey="kg" name="kg recycled" fill="#F97316" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>

                                {/* Radial progress */}
                                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
                                    <p className="text-white font-semibold text-sm mb-3">Monthly Goal Progress</p>
                                    <div className="flex items-center gap-4">
                                        <ResponsiveContainer width={100} height={100}>
                                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: 72 }]} startAngle={90} endAngle={-270}>
                                                <RadialBar dataKey="value" cornerRadius={8} fill="#F97316" background={{ fill: '#374151' }} />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div>
                                            <p className="text-3xl font-black text-white">72%</p>
                                            <p className="text-gray-400 text-xs">of monthly target</p>
                                            <p className="text-gray-500 text-xs mt-1">36 / 50 items recycled</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Best Day', value: '3.1 kg', sub: 'Saturday' },
                                        { label: 'Avg / Day', value: '2.1 kg', sub: 'this week' },
                                        { label: 'Streak', value: '7 days', sub: '🔥 on fire!' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-3 text-center">
                                            <p className="text-white font-bold text-base">{s.value}</p>
                                            <p className="text-gray-400 text-xs">{s.label}</p>
                                            <p className="text-gray-600 text-xs">{s.sub}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── BREAKDOWN ── */}
                        {tab === 'breakdown' && (
                            <>
                                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
                                    <p className="text-white font-semibold text-sm mb-4">Waste Type Breakdown</p>
                                    <div className="flex items-center gap-4">
                                        <ResponsiveContainer width={120} height={120}>
                                            <PieChart>
                                                <Pie data={WASTE_BREAKDOWN} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                                                    {WASTE_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="flex-1 space-y-2">
                                            {WASTE_BREAKDOWN.map(w => (
                                                <div key={w.name} className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: w.color }} />
                                                    <span className="text-gray-300 text-xs flex-1">{w.name}</span>
                                                    <span className="text-white font-semibold text-xs">{w.value}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Per-type bars */}
                                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 space-y-3">
                                    <p className="text-white font-semibold text-sm">Items by Category</p>
                                    {WASTE_BREAKDOWN.map(w => (
                                        <div key={w.name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-gray-400 text-xs">{w.name}</span>
                                                <span className="text-xs font-bold" style={{ color: w.color }}>{Math.round(itemsRecycled * w.value / 100)} items</span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${w.value}%` }}
                                                    transition={{ duration: 0.6, delay: 0.1 }}
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: w.color }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Environmental equivalents */}
                                <div className="bg-gradient-to-br from-green-900/30 to-teal-900/20 border border-green-700/30 rounded-2xl p-4 space-y-3">
                                    <p className="text-green-300 font-semibold text-sm">Environmental Equivalents</p>
                                    {[
                                        { emoji: '🚗', text: `Skipped ${(carbonSaved * 4).toFixed(0)} km of car travel` },
                                        { emoji: '💡', text: `Powered a home for ${(carbonSaved * 0.8).toFixed(0)} hours` },
                                        { emoji: '🌊', text: `Kept ${(itemsRecycled * 0.5).toFixed(0)} plastic items from oceans` },
                                        { emoji: '🌳', text: `Equivalent to planting ${treesEquivalent} trees` },
                                    ].map(item => (
                                        <div key={item.text} className="flex items-center gap-2.5">
                                            <span className="text-xl">{item.emoji}</span>
                                            <p className="text-gray-300 text-xs">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── MILESTONES ── */}
                        {tab === 'milestones' && (
                            <>
                                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/20 border border-yellow-700/30 rounded-2xl p-4 flex items-center gap-3">
                                    <Award className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-yellow-300 font-semibold text-sm">{MILESTONES.filter(m => m.done).length} of {MILESTONES.length} Milestones Achieved</p>
                                        <p className="text-gray-400 text-xs mt-0.5">Keep recycling to unlock the next badge!</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {MILESTONES.map((m, i) => (
                                        <motion.div
                                            key={m.label}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.07 }}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${m.done
                                                ? 'bg-gray-800/70 border-gray-600'
                                                : 'bg-gray-800/30 border-gray-800 opacity-60'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${m.done ? 'bg-yellow-500/20' : 'bg-gray-700/40'}`}>
                                                {m.emoji}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-semibold text-sm ${m.done ? 'text-white' : 'text-gray-500'}`}>{m.label}</p>
                                                <p className="text-xs mt-0.5">{m.done ? <span className="text-green-400">✓ Achieved</span> : <span className="text-gray-600">Not yet unlocked</span>}</p>
                                            </div>
                                            {m.done && <Award className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Share impact */}
                                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 text-center">
                                    <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                    <p className="text-white font-semibold text-sm">Share Your Impact</p>
                                    <p className="text-gray-400 text-xs mt-0.5 mb-3">Inspire others by sharing your eco achievements</p>
                                    <button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:from-blue-600 hover:to-cyan-700 active:scale-95 transition-all">
                                        Share on Social Media
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
