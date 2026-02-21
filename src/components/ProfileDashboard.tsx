import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Calendar,
    Award,
    Recycle,
    TreeDeciduous,
    TrendingUp,
    Star,
    Shield,
    Zap,
    Edit3,
    Camera,
    Bell,
    Lock,
    HelpCircle,
    ChevronRight,
    CheckCircle,
    Flame,
    Target,
    Globe,
    LogOut,
} from 'lucide-react';
import type { User as UserType } from '../lib/auth';
import { updateUserStats } from '../lib/auth';
import { NotificationsModal } from './NotificationsModal';
import { PrivacySecurityModal } from './PrivacySecurityModal';
import { HelpSupportModal } from './HelpSupportModal';

interface ProfileDashboardProps {
    user: UserType;
    onSignOut: () => void;
    onUserUpdate?: (updates: Partial<UserType>) => void;
}

const badges = [
    { id: 1, name: 'Eco Warrior', icon: Shield, color: 'from-green-500 to-emerald-600', desc: 'Recycled 100+ items', earned: true },
    { id: 2, name: 'Carbon Crusher', icon: Globe, color: 'from-blue-500 to-cyan-600', desc: 'Saved 50kg CO₂', earned: true },
    { id: 3, name: 'Top Recycler', icon: Star, color: 'from-yellow-500 to-orange-500', desc: 'Top 10% this month', earned: true },
    { id: 4, name: 'Streak Master', icon: Flame, color: 'from-red-500 to-orange-600', desc: '30-day streak', earned: false },
    { id: 5, name: 'Community Hero', icon: Target, color: 'from-purple-500 to-pink-600', desc: 'Report 10 dumps', earned: false },
    { id: 6, name: 'Green Legend', icon: Award, color: 'from-emerald-500 to-teal-600', desc: 'Earn 5000 GP', earned: false },
];

const activityLog = [
    { label: 'Plastic Bottle', sub: 'AI Scan', points: '+15', time: '2h ago', color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Cardboard Box', sub: 'AI Scan', points: '+25', time: '5h ago', color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Weekly Challenge', sub: 'Challenge Complete', points: '+100', time: '1d ago', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Glass Jar', sub: 'AI Scan', points: '+20', time: '2d ago', color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Community Report', sub: 'Dump Reported', points: '+50', time: '3d ago', color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

const settingsItemDefs = [
    { icon: Bell, label: 'Notifications', sub: 'Manage alerts', key: 'notifications' as const },
    { icon: Lock, label: 'Privacy & Security', sub: 'Password, data', key: 'privacy' as const },
    { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, contact us', key: 'help' as const },
];

export function ProfileDashboard({ user, onSignOut, onUserUpdate }: ProfileDashboardProps) {
    const [activeSection, setActiveSection] = useState<'overview' | 'badges' | 'activity'>('overview');
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(user.name);
    const [photoUrl, setPhotoUrl] = useState<string | null>(user.avatar ?? null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            setPhotoUrl(dataUrl);
            updateUserStats({ avatar: dataUrl });
            onUserUpdate?.({ avatar: dataUrl });
        };
        reader.readAsDataURL(file);
    };

    const saveName = () => {
        const trimmed = nameInput.trim();
        if (!trimmed) { setNameInput(user.name); setEditingName(false); return; }
        updateUserStats({ name: trimmed });
        onUserUpdate?.({ name: trimmed });
        setEditingName(false);
    };

    const handleSettingsClick = (key: 'notifications' | 'privacy' | 'help') => {
        if (key === 'notifications') setIsNotifOpen(true);
        else if (key === 'privacy') setIsPrivacyOpen(true);
        else if (key === 'help') setIsHelpOpen(true);
    };

    const levelProgress = Math.min((user.greenPoints % 1000) / 10, 100);
    const currentLevel = Math.floor(user.greenPoints / 1000) + 1;
    const joinedYear = new Date(user.joinedDate).getFullYear();
    const memberDays = Math.floor((Date.now() - new Date(user.joinedDate).getTime()) / (1000 * 60 * 60 * 24));

    const statCards = [
        { label: 'Green Points', value: user.greenPoints.toLocaleString(), icon: Zap, color: 'from-green-500 to-emerald-600', suffix: 'GP' },
        { label: 'Items Recycled', value: user.totalRecycled.toString(), icon: Recycle, color: 'from-blue-500 to-cyan-600', suffix: 'items' },
        { label: 'CO₂ Saved', value: user.carbonSaved.toFixed(1), icon: TreeDeciduous, color: 'from-purple-500 to-pink-600', suffix: 'kg' },
        { label: 'Current Level', value: `Lv.${currentLevel}`, icon: TrendingUp, color: 'from-yellow-500 to-orange-500', suffix: '' },
    ];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
            >
                {/* Profile Hero Card */}
                <div className="relative bg-gradient-to-br from-green-900/60 via-gray-800/80 to-gray-900/60 backdrop-blur border border-green-500/20 rounded-3xl p-6 overflow-hidden">
                    {/* Glow blob */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-start gap-4 relative z-10">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 overflow-hidden">
                                {photoUrl
                                    ? <img src={photoUrl} alt="avatar" className="w-full h-full object-cover" />
                                    : <User className="w-10 h-10 text-white" />}
                            </div>
                            <button
                                title="Change profile photo"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center hover:bg-green-500 hover:border-green-400 transition-colors"
                            >
                                <Camera className="w-3.5 h-3.5 text-gray-300" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                title="Upload profile photo"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {editingName ? (
                                    <input
                                        autoFocus
                                        title="Edit display name"
                                        placeholder="Enter name"
                                        value={nameInput}
                                        onChange={e => setNameInput(e.target.value)}
                                        onBlur={saveName}
                                        onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameInput(user.name); setEditingName(false); } }}
                                        className="flex-1 bg-gray-700/70 border border-green-500/50 text-white text-xl font-bold rounded-lg px-2 py-0.5 outline-none focus:border-green-400 min-w-0"
                                    />
                                ) : (
                                    <h2 className="text-xl font-bold text-white truncate">{nameInput}</h2>
                                )}
                                <button
                                    title="Edit name"
                                    onClick={() => setEditingName(true)}
                                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-green-400 transition-colors"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-1">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Member since {joinedYear} · {memberDays} days</span>
                            </div>
                        </div>
                    </div>

                    {/* Level Progress */}
                    <div className="mt-5 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                    <Star className="w-3.5 h-3.5 text-white fill-white" />
                                </div>
                                <span className="text-white font-semibold text-sm">Level {currentLevel} — Eco Champion</span>
                            </div>
                            <span className="text-gray-400 text-xs">{user.greenPoints % 1000}/1000 XP</span>
                        </div>
                        <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${levelProgress}%` }}
                                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                            />
                        </div>
                        <p className="text-gray-500 text-xs mt-1.5">
                            {1000 - (user.greenPoints % 1000)} GP needed to reach Level {currentLevel + 1}
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-4"
                        >
                            <div className={`w-9 h-9 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                                <stat.icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                            </div>
                            <p className="text-xl font-bold text-white leading-none">{stat.value}</p>
                            <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Section Tabs */}
                <div className="flex bg-gray-800/60 rounded-2xl p-1 gap-1">
                    {(['overview', 'badges', 'activity'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setActiveSection(s)}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all capitalize ${activeSection === s
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Overview Section */}
                {activeSection === 'overview' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {/* Eco Impact Summary */}
                        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-5">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                Your Eco Impact
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Plastic Saved', value: '12.4 kg', pct: 72 },
                                    { label: 'Paper Recycled', value: '8.1 kg', pct: 55 },
                                    { label: 'Glass Recycled', value: '5.6 kg', pct: 38 },
                                    { label: 'Metal Recycled', value: '3.2 kg', pct: 22 },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">{item.label}</span>
                                            <span className="text-white font-medium">{item.value}</span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.pct}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
                            <div className="px-5 pt-4 pb-2">
                                <h3 className="text-white font-semibold">Settings</h3>
                            </div>
                            {settingsItemDefs.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSettingsClick(item.key)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-700/30 transition-colors border-t border-gray-700/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-700/60 rounded-xl flex items-center justify-center">
                                            <item.icon className="w-4 h-4 text-gray-300" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white text-sm font-medium">{item.label}</p>
                                            <p className="text-gray-500 text-xs">{item.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                </button>
                            ))}
                        </div>

                        {/* Sign Out */}
                        <button
                            onClick={onSignOut}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all rounded-2xl py-3.5 font-semibold"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </motion.div>
                )}

                {/* Badges Section */}
                {activeSection === 'badges' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-400 text-sm">{badges.filter(b => b.earned).length}/{badges.length} badges earned</p>
                            <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                {badges.filter(b => b.earned).length} earned
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {badges.map((badge, i) => (
                                <motion.div
                                    key={badge.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.07 }}
                                    className={`bg-gray-800/50 backdrop-blur border rounded-2xl p-4 text-center transition-all ${badge.earned
                                        ? 'border-gray-600 hover:border-green-500/40'
                                        : 'border-gray-700/50 opacity-50'
                                        }`}
                                >
                                    <div className={`w-14 h-14 bg-gradient-to-br ${badge.earned ? badge.color : 'from-gray-600 to-gray-700'} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg ${badge.earned ? 'shadow-green-500/10' : ''}`}>
                                        <badge.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <p className="text-white text-sm font-semibold mb-1">{badge.name}</p>
                                    <p className="text-gray-400 text-xs leading-snug">{badge.desc}</p>
                                    {badge.earned && (
                                        <div className="mt-2 inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full">
                                            <CheckCircle className="w-3 h-3" />
                                            Earned
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Activity Section */}
                {activeSection === 'activity' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                        <p className="text-gray-400 text-sm">Your recent eco-actions</p>
                        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
                            {activityLog.map((act, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-center justify-between px-4 py-3.5 border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/20 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${act.bg} rounded-xl flex items-center justify-center`}>
                                            <Recycle className={`w-5 h-5 ${act.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{act.label}</p>
                                            <p className="text-gray-500 text-xs">{act.sub} · {act.time}</p>
                                        </div>
                                    </div>
                                    <span className={`${act.color} font-bold text-sm`}>{act.points}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Weekly Summary */}
                        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/20 rounded-2xl p-4">
                            <p className="text-green-400 font-semibold text-sm mb-3 flex items-center gap-2">
                                <Flame className="w-4 h-4" /> This Week's Summary
                            </p>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                {[
                                    { label: 'Items', value: '12' },
                                    { label: 'Points', value: '210' },
                                    { label: 'CO₂ (kg)', value: '3.4' },
                                ].map((s, i) => (
                                    <div key={i}>
                                        <p className="text-white font-bold text-lg">{s.value}</p>
                                        <p className="text-gray-400 text-xs">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* ── Settings Modals ── */}
            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                user={user}
            />
            <PrivacySecurityModal
                isOpen={isPrivacyOpen}
                onClose={() => setIsPrivacyOpen(false)}
                user={user}
                onAccountDeleted={onSignOut}
            />
            <HelpSupportModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
                user={user}
            />
        </>);
}
