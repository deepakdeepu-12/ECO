import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Users, Trophy, Zap, CheckCircle, Clock, Star,
    Flame, Target, Gift, ChevronRight, Crown, Medal,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Challenge {
    id: string;
    title: string;
    description: string;
    emoji: string;
    category: string;
    daysLeft: number;
    participants: number;
    reward: number; // GP
    target: number;
    progress: number; // user's progress
    joined: boolean;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface LeaderEntry {
    rank: number;
    name: string;
    avatar: string;
    points: number;
    badge: string;
    isYou?: boolean;
}

// ── Data ───────────────────────────────────────────────────────────────────
const INITIAL_CHALLENGES: Challenge[] = [
    {
        id: 'c1', title: 'Plastic-Free Week', emoji: '🚫♻️',
        description: 'Recycle 20 plastic items this week and earn bonus GP',
        category: 'Plastic', daysLeft: 3, participants: 1240, reward: 300,
        target: 20, progress: 14, joined: true, difficulty: 'Medium',
    },
    {
        id: 'c2', title: 'Green Neighbourhood', emoji: '🏘️',
        description: 'Be in the top 10 recyclers in your neighbourhood',
        category: 'Community', daysLeft: 7, participants: 580, reward: 500,
        target: 50, progress: 0, joined: false, difficulty: 'Hard',
    },
    {
        id: 'c3', title: 'Zero-Waste Monday', emoji: '🌱',
        description: 'Scan and properly dispose at least 5 items every Monday',
        category: 'Daily', daysLeft: 1, participants: 3200, reward: 150,
        target: 5, progress: 5, joined: true, difficulty: 'Easy',
    },
    {
        id: 'c4', title: 'E-Waste Hero', emoji: '💻',
        description: 'Drop off 3 electronic items at an e-waste centre',
        category: 'E-Waste', daysLeft: 14, participants: 420, reward: 400,
        target: 3, progress: 0, joined: false, difficulty: 'Medium',
    },
    {
        id: 'c5', title: 'Composting Champion', emoji: '🌿',
        description: 'Log 15 organic waste items for composting',
        category: 'Organic', daysLeft: 5, participants: 870, reward: 200,
        target: 15, progress: 7, joined: true, difficulty: 'Easy',
    },
];

const LEADERBOARD: LeaderEntry[] = [
    { rank: 1, name: 'Priya Sharma', avatar: '👩🏽', points: 4820, badge: '🏆' },
    { rank: 2, name: 'Arjun Mehta', avatar: '👨🏽', points: 4310, badge: '🥈' },
    { rank: 3, name: 'Sana Qureshi', avatar: '👩🏻', points: 3990, badge: '🥉' },
    { rank: 4, name: 'Rahul Verma', avatar: '👨🏻', points: 3540, badge: '⭐' },
    { rank: 5, name: 'You', avatar: '🧑', points: 1250, badge: '🌱', isYou: true },
    { rank: 6, name: 'Nidhi Patel', avatar: '👩🏾', points: 1080, badge: '🌱' },
    { rank: 7, name: 'Vikram Singh', avatar: '👨🏾', points: 890, badge: '🌱' },
];

const EXCLUSIVE_REWARDS = [
    { name: '1-Month Free EcoSync Pro', emoji: '⚡', pts: 2000, desc: 'Unlock premium AI features' },
    { name: 'ₓ2 Point Multiplier (7d)', emoji: '🚀', pts: 1500, desc: 'Double all points for a week' },
    { name: 'Eco Gift Hamper', emoji: '🎁', pts: 3000, desc: 'Curated sustainable products' },
    { name: 'Plant a Forest (5 Trees)', emoji: '🌲', pts: 2500, desc: 'Certified reforestation project' },
];

const DIFF_COLOR: Record<string, string> = {
    Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444',
};

type Tab = 'challenges' | 'leaderboard' | 'rewards';

interface CommunityChallengesProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommunityChallenges({ isOpen, onClose }: CommunityChallengesProps) {
    const [tab, setTab] = useState<Tab>('challenges');
    const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
    const [justJoined, setJustJoined] = useState<string | null>(null);

    const activeCount = challenges.filter(c => c.joined).length;
    const completedCount = challenges.filter(c => c.joined && c.progress >= c.target).length;

    const handleJoin = (id: string) => {
        setChallenges(prev =>
            prev.map(c => c.id === id ? { ...c, joined: true, participants: c.participants + 1 } : c)
        );
        setJustJoined(id);
        setTimeout(() => setJustJoined(null), 2000);
    };

    if (!isOpen) return null;

    const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
        { id: 'challenges', label: 'Challenges', icon: Target },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { id: 'rewards', label: 'Rewards', icon: Gift },
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
                    style={{ maxWidth: 520, height: '90vh' }}
                >
                    {/* ── Header ── */}
                    <div className="flex-shrink-0 bg-gradient-to-br from-teal-900/40 to-green-900/20 border-b border-gray-800 px-5 pt-4 pb-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg leading-none">Community Challenges</h2>
                                    <p className="text-gray-400 text-xs mt-0.5">{activeCount} active · {completedCount} completed</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-9 h-9 bg-gray-800/60 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Streak banner */}
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/20 rounded-2xl px-4 py-2.5 flex items-center gap-3 mb-4">
                            <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
                            <span className="text-orange-300 text-sm font-semibold">7-day recycling streak!</span>
                            <span className="ml-auto text-orange-400 text-xs font-bold">🔥 Keep it up</span>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-t border-gray-800">
                            {TABS.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all ${tab === t.id ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    <t.icon className="w-3.5 h-3.5" />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">

                        {/* ── CHALLENGES TAB ── */}
                        {tab === 'challenges' && challenges.map((ch, i) => {
                            const pct = Math.min(100, Math.round((ch.progress / ch.target) * 100));
                            const done = ch.progress >= ch.target;
                            return (
                                <motion.div
                                    key={ch.id}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className={`bg-gray-800/60 border rounded-2xl p-4 transition-all ${done ? 'border-green-500/40' : ch.joined ? 'border-teal-500/30' : 'border-gray-700'
                                        }`}
                                >
                                    {/* Top row */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="text-2xl flex-shrink-0 w-11 h-11 bg-gray-700/60 rounded-xl flex items-center justify-center">
                                            {ch.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-white font-bold text-sm">{ch.title}</p>
                                                <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                                                    style={{ backgroundColor: DIFF_COLOR[ch.difficulty] + '22', color: DIFF_COLOR[ch.difficulty] }}>
                                                    {ch.difficulty}
                                                </span>
                                                {done && <CheckCircle className="w-4 h-4 text-green-400" />}
                                            </div>
                                            <p className="text-gray-400 text-xs mt-0.5 leading-snug">{ch.description}</p>
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ch.participants.toLocaleString()} joined</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ch.daysLeft}d left</span>
                                        <span className="flex items-center gap-1 ml-auto font-bold text-teal-400">
                                            <Zap className="w-3 h-3" />{ch.reward} GP
                                        </span>
                                    </div>

                                    {/* Progress bar (if joined) */}
                                    {ch.joined && (
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-gray-500 text-xs">Progress</span>
                                                <span className="text-xs font-bold" style={{ color: done ? '#10B981' : '#14B8A6' }}>
                                                    {ch.progress}/{ch.target} {done ? '✓ Complete!' : ''}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.7 }}
                                                    className="h-full rounded-full"
                                                    style={{ background: done ? '#10B981' : 'linear-gradient(to right,#14B8A6,#10B981)' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action */}
                                    {!ch.joined ? (
                                        <button
                                            onClick={() => handleJoin(ch.id)}
                                            className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${justJoined === ch.id
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gradient-to-r from-teal-500 to-green-600 text-white hover:from-teal-600 hover:to-green-700'
                                                }`}
                                        >
                                            {justJoined === ch.id ? <><CheckCircle className="w-4 h-4" /> Joined!</> : <><ChevronRight className="w-4 h-4" /> Join Challenge</>}
                                        </button>
                                    ) : done ? (
                                        <div className="w-full py-2.5 rounded-xl text-sm font-bold bg-green-500/10 text-green-400 border border-green-500/30 text-center">
                                            🎉 Challenge Complete — {ch.reward} GP Earned!
                                        </div>
                                    ) : (
                                        <div className="w-full py-2 rounded-xl text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20 text-center">
                                            In Progress — {ch.target - ch.progress} more to go
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}

                        {/* ── LEADERBOARD TAB ── */}
                        {tab === 'leaderboard' && (
                            <>
                                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/20 border border-yellow-700/30 rounded-2xl p-4 text-center mb-2">
                                    <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-1" />
                                    <p className="text-yellow-300 font-bold text-sm">Neighbourhood Leaderboard</p>
                                    <p className="text-gray-400 text-xs mt-0.5">Top recyclers in your area this month</p>
                                </div>

                                {/* Top 3 podium */}
                                <div className="flex items-end justify-center gap-2 pb-2">
                                    {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((entry, i) => {
                                        const heights = ['h-24', 'h-32', 'h-20'];
                                        const colors = ['from-gray-400 to-gray-500', 'from-yellow-400 to-amber-500', 'from-orange-400 to-amber-600'];
                                        const label = ['2nd', '1st', '3rd'];
                                        return (
                                            <motion.div
                                                key={entry.rank}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex flex-col items-center gap-1"
                                            >
                                                <span className="text-2xl">{entry.avatar}</span>
                                                <span className="text-white text-xs font-semibold">{entry.name.split(' ')[0]}</span>
                                                <span className="text-teal-400 text-xs font-bold">{entry.points.toLocaleString()} GP</span>
                                                <div className={`${heights[i]} w-16 bg-gradient-to-t ${colors[i]} rounded-t-xl flex items-start justify-center pt-2`}>
                                                    <span className="text-white font-black text-sm">{label[i]}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Full list */}
                                <div className="space-y-2">
                                    {LEADERBOARD.map((entry, i) => (
                                        <motion.div
                                            key={entry.rank}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${entry.isYou ? 'bg-teal-500/10 border-teal-500/40' : 'bg-gray-800/60 border-gray-700'
                                                }`}
                                        >
                                            <span className="text-lg w-6 text-center font-bold" style={{ color: entry.rank <= 3 ? '#F59E0B' : '#6B7280' }}>
                                                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                                            </span>
                                            <span className="text-xl">{entry.avatar}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold ${entry.isYou ? 'text-teal-300' : 'text-white'}`}>
                                                    {entry.name} {entry.isYou && <span className="text-xs text-teal-500">(You)</span>}
                                                </p>
                                                <p className="text-gray-500 text-xs">{entry.badge} Tier</p>
                                            </div>
                                            <span className="text-teal-400 font-bold text-sm">{entry.points.toLocaleString()} GP</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 text-center">
                                    <Medal className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-white text-sm font-semibold">Climb the ranks!</p>
                                    <p className="text-gray-400 text-xs mt-0.5">Earn 3,000 more GP to reach the top 3 and win exclusive prizes</p>
                                </div>
                            </>
                        )}

                        {/* ── REWARDS TAB ── */}
                        {tab === 'rewards' && (
                            <>
                                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-700/30 rounded-2xl p-4 flex items-center gap-3 mb-2">
                                    <Star className="w-8 h-8 text-purple-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-purple-300 font-bold text-sm">Exclusive Challenge Rewards</p>
                                        <p className="text-gray-400 text-xs mt-0.5">Top performers unlock these prizes each month</p>
                                    </div>
                                </div>

                                {EXCLUSIVE_REWARDS.map((r, i) => (
                                    <motion.div
                                        key={r.name}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex items-center gap-4"
                                    >
                                        <div className="w-14 h-14 bg-gray-700/60 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                                            {r.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-semibold text-sm">{r.name}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">{r.desc}</p>
                                            <span className="flex items-center gap-1 mt-1 text-xs font-bold text-purple-400">
                                                <Zap className="w-3 h-3" />{r.pts.toLocaleString()} GP required
                                            </span>
                                        </div>
                                        <button className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-gray-700 text-gray-400 cursor-default">
                                            Top Rank
                                        </button>
                                    </motion.div>
                                ))}

                                <div className="bg-gradient-to-r from-teal-900/30 to-green-900/20 border border-teal-700/30 rounded-2xl p-4 text-center">
                                    <Flame className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                                    <p className="text-white font-semibold text-sm">Keep Competing!</p>
                                    <p className="text-gray-400 text-xs mt-1">Complete challenges, earn GP, and unlock these exclusive rewards by reaching the top of the leaderboard each month.</p>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
