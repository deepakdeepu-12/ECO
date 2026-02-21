import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Gift,
    Zap,
    CheckCircle,
    Star,
    ShoppingBag,
    Clock,
    ChevronRight,
    Leaf,
    Award,
    Trophy,
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description: string;
    points: number;
    category: string;
    emoji: string;
    badge?: string;
    stock: number;
}

interface RedeemHistoryItem {
    name: string;
    points: number;
    date: string;
}

const PRODUCTS: Product[] = [
    { id: '1', name: 'Reusable Bamboo Straw Set', description: 'Set of 6 biodegradable bamboo straws with cleaning brush', points: 150, category: 'Kitchen', emoji: '🥤', badge: 'Popular', stock: 42 },
    { id: '2', name: 'Organic Cotton Tote Bag', description: 'Large eco-friendly shopping bag made from 100% organic cotton', points: 200, category: 'Lifestyle', emoji: '👜', stock: 28 },
    { id: '3', name: 'Beeswax Food Wraps (3-pack)', description: 'Natural alternative to plastic wrap, reusable up to 1 year', points: 300, category: 'Kitchen', emoji: '🍯', badge: 'Best Value', stock: 15 },
    { id: '4', name: 'Recycled Notebook', description: 'A5 notebook made from 100% recycled paper, 120 pages', points: 120, category: 'Stationery', emoji: '📓', stock: 60 },
    { id: '5', name: 'Seed Bomb Kit', description: 'Grow wildflowers from seed bombs — great for biodiversity', points: 180, category: 'Garden', emoji: '🌱', badge: 'New', stock: 20 },
    { id: '6', name: 'Bamboo Toothbrush Pack', description: '4 biodegradable toothbrushes with plant-based bristles', points: 250, category: 'Personal Care', emoji: '🪥', stock: 35 },
    { id: '7', name: 'Solar Power Bank (5000mAh)', description: 'Charge devices using clean solar energy on the go', points: 800, category: 'Tech', emoji: '☀️', badge: 'Premium', stock: 8 },
    { id: '8', name: 'EcoSync Plant a Tree', description: 'We plant a tree in your name in a certified reforestation project', points: 500, category: 'Impact', emoji: '🌳', badge: '🌟 Featured', stock: 999 },
];

const REDEEM_HISTORY: RedeemHistoryItem[] = [
    { name: 'Bamboo Toothbrush Pack', points: 250, date: '2 days ago' },
    { name: 'Recycled Notebook', points: 120, date: '1 week ago' },
    { name: 'EcoSync Plant a Tree', points: 500, date: '2 weeks ago' },
];

const TIERS = [
    { name: 'Seedling', minPts: 0, color: '#6B7280', emoji: '🌱' },
    { name: 'Sapling', minPts: 500, color: '#10B981', emoji: '🌿' },
    { name: 'Tree', minPts: 1500, color: '#3B82F6', emoji: '🌳' },
    { name: 'Forest', minPts: 5000, color: '#8B5CF6', emoji: '🌲' },
    { name: 'Eco Hero', minPts: 10000, color: '#F59E0B', emoji: '🏆' },
];

function getCurrentTier(pts: number) {
    return [...TIERS].reverse().find(t => pts >= t.minPts) ?? TIERS[0];
}
function getNextTier(pts: number) {
    return TIERS.find(t => t.minPts > pts);
}

interface RecyclingRewardsProps {
    isOpen: boolean;
    onClose: () => void;
    userPoints?: number;
}

type Tab = 'shop' | 'history' | 'tiers';

export function RecyclingRewards({ isOpen, onClose, userPoints = 1250 }: RecyclingRewardsProps) {
    const [points, setPoints] = useState(userPoints);
    const [tab, setTab] = useState<Tab>('shop');
    const [justRedeemed, setJustRedeemed] = useState<string | null>(null);
    const [history, setHistory] = useState<RedeemHistoryItem[]>(REDEEM_HISTORY);
    const [categoryFilter, setCategoryFilter] = useState('All');

    const tier = getCurrentTier(points);
    const nextTier = getNextTier(points);
    const tierProgress = nextTier
        ? ((points - tier.minPts) / (nextTier.minPts - tier.minPts)) * 100
        : 100;

    const categories = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];
    const filtered = categoryFilter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === categoryFilter);

    const handleRedeem = (product: Product) => {
        if (points < product.points || justRedeemed === product.id) return;
        setPoints(prev => prev - product.points);
        setJustRedeemed(product.id);
        setHistory(prev => [{ name: product.name, points: product.points, date: 'Just now' }, ...prev]);
        setTimeout(() => setJustRedeemed(null), 2000);
    };

    if (!isOpen) return null;

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
                    style={{ maxWidth: 520, height: '90vh' }}
                >
                    {/* Header */}
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-900/60 to-pink-900/40 border-b border-gray-800">
                        {/* Close */}
                        <div className="flex justify-end px-5 pt-4">
                            <button onClick={onClose} className="w-9 h-9 bg-gray-800/60 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Points hero */}
                        <div className="px-5 pb-5 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Gift className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-gray-400 text-sm mb-1">Your Green Points Balance</p>
                            <motion.p
                                key={points}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="text-4xl font-black text-white"
                            >
                                {points.toLocaleString()}
                                <span className="text-lg text-purple-400 font-semibold ml-2">GP</span>
                            </motion.p>

                            {/* Tier badge */}
                            <div className="flex items-center justify-center gap-2 mt-2 mb-3">
                                <span className="text-lg">{tier.emoji}</span>
                                <span className="text-sm font-bold" style={{ color: tier.color }}>{tier.name}</span>
                                <span className="text-gray-600 text-xs">Tier</span>
                            </div>

                            {/* Tier progress bar */}
                            {nextTier && (
                                <div className="max-w-xs mx-auto">
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${tierProgress}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className="h-full rounded-full"
                                            style={{ background: `linear-gradient(to right, ${tier.color}, ${nextTier.color})` }}
                                        />
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1">
                                        {(nextTier.minPts - points).toLocaleString()} GP to reach {nextTier.emoji} {nextTier.name}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex border-t border-gray-800">
                            {([
                                { id: 'shop', label: 'Redeem', icon: ShoppingBag },
                                { id: 'history', label: 'History', icon: Clock },
                                { id: 'tiers', label: 'Tiers', icon: Trophy },
                            ] as { id: Tab; label: string; icon: typeof ShoppingBag }[]).map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors ${tab === t.id ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    <t.icon className="w-4 h-4" />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto">

                        {/* SHOP TAB */}
                        {tab === 'shop' && (
                            <div className="p-4">
                                {/* Category chips */}
                                <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategoryFilter(cat)}
                                            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${categoryFilter === cat ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Product grid */}
                                <div className="grid grid-cols-1 gap-3">
                                    {filtered.map((product, i) => {
                                        const canAfford = points >= product.points;
                                        const isJust = justRedeemed === product.id;

                                        return (
                                            <motion.div
                                                key={product.id}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`bg-gray-800/60 border rounded-2xl p-4 flex items-center gap-4 transition-all ${isJust ? 'border-purple-500/40' : canAfford ? 'border-gray-700 hover:border-purple-500/40' : 'border-gray-800 opacity-60'}`}
                                            >
                                                {/* Emoji */}
                                                <div className="w-14 h-14 bg-gray-700/60 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                                                    {product.emoji}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-white font-semibold text-sm leading-tight">{product.name}</p>
                                                        {product.badge && (
                                                            <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-lg font-medium">{product.badge}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-500 text-xs mt-0.5 leading-snug">{product.description}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="flex items-center gap-1 text-sm font-bold text-purple-400">
                                                            <Zap className="w-3.5 h-3.5" />
                                                            {product.points.toLocaleString()} GP
                                                        </span>
                                                        <span className="text-gray-600 text-xs">{product.stock} left</span>
                                                    </div>
                                                </div>

                                                {/* Redeem button */}
                                                <button
                                                    onClick={() => handleRedeem(product)}
                                                    disabled={!canAfford || isJust}
                                                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isJust
                                                            ? 'bg-green-500 text-white scale-95'
                                                            : canAfford
                                                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 active:scale-95'
                                                                : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {isJust ? (
                                                        <CheckCircle className="w-4 h-4" />
                                                    ) : canAfford ? (
                                                        'Redeem'
                                                    ) : (
                                                        'Need more'
                                                    )}
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Earn more tips */}
                                <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                                    <p className="text-green-400 font-semibold text-sm mb-2 flex items-center gap-2">
                                        <Leaf className="w-4 h-4" /> How to Earn More Points
                                    </p>
                                    <div className="space-y-1.5">
                                        {[
                                            { action: 'Scan & classify waste', pts: '+5–30 GP per scan' },
                                            { action: 'Complete weekly challenges', pts: '+100 GP' },
                                            { action: 'Report illegal dump sites', pts: '+50 GP' },
                                            { action: 'Refer a friend', pts: '+200 GP' },
                                        ].map(item => (
                                            <div key={item.action} className="flex items-center justify-between">
                                                <span className="text-gray-400 text-xs flex items-center gap-1.5">
                                                    <ChevronRight className="w-3 h-3 text-green-500" />
                                                    {item.action}
                                                </span>
                                                <span className="text-green-400 text-xs font-semibold">{item.pts}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* HISTORY TAB */}
                        {tab === 'history' && (
                            <div className="p-4">
                                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-purple-400" />
                                    Redemption History
                                </h3>
                                {history.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                        <p className="text-gray-500">No redemptions yet</p>
                                        <p className="text-gray-600 text-sm mt-1">Redeem your first reward!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {history.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                                    <Gift className="w-5 h-5 text-purple-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                                                    <p className="text-gray-500 text-xs">{item.date}</p>
                                                </div>
                                                <span className="text-red-400 font-bold text-sm flex items-center gap-1">
                                                    <Zap className="w-3.5 h-3.5" />
                                                    -{item.points}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TIERS TAB */}
                        {tab === 'tiers' && (
                            <div className="p-4 space-y-3">
                                <p className="text-gray-400 text-xs text-center mb-4">Earn GP by recycling to climb the ranks and unlock exclusive perks!</p>
                                {TIERS.map((t, i) => {
                                    const isActive = tier.name === t.name;
                                    const isPast = points >= t.minPts;
                                    return (
                                        <motion.div
                                            key={t.name}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.07 }}
                                            className={`rounded-2xl p-4 border transition-all ${isActive
                                                    ? 'border-2 bg-gray-800/80'
                                                    : isPast
                                                        ? 'border-gray-700 bg-gray-800/40'
                                                        : 'border-gray-800 bg-gray-800/20 opacity-50'
                                                }`}
                                            style={{ borderColor: isActive ? t.color : undefined }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{t.emoji}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="text-white font-bold" style={{ color: isPast ? t.color : undefined }}>{t.name}</p>
                                                        {isActive && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">Current</span>}
                                                        {!isActive && isPast && <CheckCircle className="w-4 h-4" style={{ color: t.color }} />}
                                                    </div>
                                                    <p className="text-gray-500 text-xs">{t.minPts.toLocaleString()} GP required</p>
                                                </div>
                                                {isActive && (
                                                    <div className="flex">
                                                        {[1, 2, 3].map(s => <Star key={s} className="w-4 h-4 fill-current" style={{ color: t.color }} />)}
                                                    </div>
                                                )}
                                            </div>
                                            {isActive && (
                                                <div className="mt-3 pt-3 border-t border-gray-700">
                                                    <p className="text-xs font-semibold mb-1" style={{ color: t.color }}>
                                                        <Award className="w-3 h-3 inline mr-1" />
                                                        {t.name} Perks
                                                    </p>
                                                    <div className="text-gray-400 text-xs space-y-0.5">
                                                        <p>✓ Access to all standard rewards</p>
                                                        <p>✓ 1x point multiplier on scans</p>
                                                        {points >= 500 && <p>✓ Early access to new products</p>}
                                                        {points >= 1500 && <p>✓ 1.5x multiplier on challenges</p>}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
