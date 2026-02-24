import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, Loader2 } from 'lucide-react';
import type { User as UserType } from '../lib/auth';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserType;
}

interface NotifPrefs {
    recyclingReminders: boolean;
    challengeAlerts: boolean;
    communityReports: boolean;
    weeklySummary: boolean;
    newBadges: boolean;
    binFull: boolean;
}

const notifLabels: { key: keyof NotifPrefs; label: string; desc: string }[] = [
    { key: 'recyclingReminders', label: 'Recycling Reminders', desc: 'Daily nudges to scan and recycle items' },
    { key: 'challengeAlerts', label: 'Challenge Alerts', desc: 'New community challenges & deadlines' },
    { key: 'communityReports', label: 'Community Reports', desc: 'Updates on illegal dump reports nearby' },
    { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Your weekly eco-impact digest' },
    { key: 'newBadges', label: 'New Badges', desc: 'Alerts when you earn a new badge' },
    { key: 'binFull', label: 'Bin Full Alerts', desc: 'When a nearby smart bin is almost full' },
];

export function NotificationsModal({ isOpen, onClose, user }: NotificationsModalProps) {
    const [prefs, setPrefs] = useState<NotifPrefs>({
        recyclingReminders: true,
        challengeAlerts: true,
        communityReports: true,
        weeklySummary: true,
        newBadges: true,
        binFull: false,
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/user/${user.id}/notifications`)
            .then(r => r.json())
            .then(res => { if (res.success) setPrefs(res.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [isOpen, user.id]);

    const toggle = (key: keyof NotifPrefs) => {
        setPrefs(p => ({ ...p, [key]: !p[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/user/${user.id}/notifications`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prefs),
            });
            const data = await res.json();
            setToast({ type: data.success ? 'success' : 'error', msg: data.message });
        } catch {
            setToast({ type: 'error', msg: 'Could not connect to server.' });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">Notifications</h2>
                                    <p className="text-gray-400 text-xs">Manage your alert preferences</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors" aria-label="Close notifications">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4 space-y-1 max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="py-12 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                                </div>
                            ) : (
                                notifLabels.map(({ key, label, desc }) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between py-3.5 border-b border-gray-800/60 last:border-b-0"
                                    >
                                        <div>
                                            <p className="text-white text-sm font-medium">{label}</p>
                                            <p className="text-gray-500 text-xs">{desc}</p>
                                        </div>
                                        <button
                                            onClick={() => toggle(key)}
                                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${prefs[key] ? 'bg-green-500' : 'bg-gray-600'
                                                }`}
                                            aria-label={`Toggle ${label}`}
                                        >
                                            <motion.span
                                                layout
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow ${prefs[key] ? 'left-6' : 'left-0.5'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Toast */}
                        <AnimatePresence>
                            {toast && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`mx-6 mb-2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${toast.type === 'success'
                                            ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                            : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                        }`}
                                >
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                    {toast.msg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-800 flex gap-3">
                            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors font-medium text-sm">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {saving ? 'Saving…' : 'Save Preferences'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
