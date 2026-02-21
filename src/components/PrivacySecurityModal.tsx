import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Loader2, Shield } from 'lucide-react';
import type { User as UserType } from '../lib/auth';

interface PrivacySecurityModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserType;
    onAccountDeleted: () => void;
}

export function PrivacySecurityModal({ isOpen, onClose, user, onAccountDeleted }: PrivacySecurityModalProps) {
    // Password change
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwToast, setPwToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Delete account
    const [deleteInput, setDeleteInput] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteToast, setDeleteToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [showDeleteZone, setShowDeleteZone] = useState(false);

    const showToast = (setter: typeof setPwToast, type: 'success' | 'error', msg: string) => {
        setter({ type, msg });
        setTimeout(() => setter(null), 4000);
    };

    const handlePasswordChange = async () => {
        if (!currentPw || !newPw || !confirmPw) {
            showToast(setPwToast, 'error', 'Please fill in all fields.');
            return;
        }
        if (newPw !== confirmPw) {
            showToast(setPwToast, 'error', 'New passwords do not match.');
            return;
        }
        setPwLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/user/${user.id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
            });
            const data = await res.json();
            showToast(setPwToast, data.success ? 'success' : 'error', data.message);
            if (data.success) { setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
        } catch {
            showToast(setPwToast, 'error', 'Could not connect to server.');
        } finally {
            setPwLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/user/${user.id}/account`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirmation: deleteInput }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(setDeleteToast, 'success', data.message);
                setTimeout(() => { onClose(); onAccountDeleted(); }, 1500);
            } else {
                showToast(setDeleteToast, 'error', data.message);
            }
        } catch {
            showToast(setDeleteToast, 'error', 'Could not connect to server.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const inputClass = 'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all';

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
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">Privacy & Security</h2>
                                    <p className="text-gray-400 text-xs">Manage password & account</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {/* Change Password */}
                            <div className="px-6 py-5 border-b border-gray-800">
                                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-blue-400" />
                                    Change Password
                                </h3>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            placeholder="Current password"
                                            value={currentPw}
                                            onChange={e => setCurrentPw(e.target.value)}
                                            className={inputClass}
                                        />
                                        <button
                                            onClick={() => setShowCurrent(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            placeholder="New password (min 6 chars)"
                                            value={newPw}
                                            onChange={e => setNewPw(e.target.value)}
                                            className={inputClass}
                                        />
                                        <button
                                            onClick={() => setShowNew(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPw}
                                        onChange={e => setConfirmPw(e.target.value)}
                                        className={inputClass}
                                    />

                                    <AnimatePresence>
                                        {pwToast && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium ${pwToast.type === 'success'
                                                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                                        : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                                    }`}
                                            >
                                                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                                {pwToast.msg}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={pwLoading}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {pwLoading ? 'Changing…' : 'Change Password'}
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="px-6 py-5">
                                <button
                                    onClick={() => setShowDeleteZone(v => !v)}
                                    className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-3 hover:text-red-300 transition-colors"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Danger Zone
                                    <span className="text-gray-500 text-xs font-normal ml-1">(click to expand)</span>
                                </button>

                                <AnimatePresence>
                                    {showDeleteZone && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 space-y-3">
                                                <p className="text-red-300 text-xs leading-relaxed">
                                                    This action is <strong>irreversible</strong>. All your data, points, and activity will be permanently deleted.
                                                    Type <span className="font-mono font-bold text-red-400 bg-red-500/10 px-1 rounded">DELETE</span> to confirm.
                                                </p>
                                                <input
                                                    type="text"
                                                    placeholder='Type "DELETE" to confirm'
                                                    value={deleteInput}
                                                    onChange={e => setDeleteInput(e.target.value)}
                                                    className="w-full bg-gray-800 border border-red-500/30 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                />

                                                <AnimatePresence>
                                                    {deleteToast && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${deleteToast.type === 'success'
                                                                    ? 'bg-green-500/15 text-green-400'
                                                                    : 'bg-red-500/15 text-red-400'
                                                                }`}
                                                        >
                                                            {deleteToast.msg}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={deleteInput !== 'DELETE' || deleteLoading}
                                                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                                >
                                                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                                                    {deleteLoading ? 'Deleting…' : 'Delete My Account'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-800">
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-2xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors font-medium text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
