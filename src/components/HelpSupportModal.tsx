import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle, Loader2, MessageSquare } from 'lucide-react';
import type { User as UserType } from '../lib/auth';

interface HelpSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserType;
}

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

const CATEGORIES = ['General', 'Account', 'Rewards', 'Technical', 'Privacy', 'Other'];

export function HelpSupportModal({ isOpen, onClose, user }: HelpSupportModalProps) {
    const [tab, setTab] = useState<'faq' | 'contact'>('faq');
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [faqLoading, setFaqLoading] = useState(false);

    // Contact form
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [category, setCategory] = useState('General');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string; ticketId?: string } | null>(null);

    useEffect(() => {
        if (!isOpen || tab !== 'faq') return;
        setFaqLoading(true);
        fetch('http://localhost:3001/api/support/faqs')
            .then(r => r.json())
            .then(res => { if (res.success) setFaqs(res.data); })
            .catch(() => { })
            .finally(() => setFaqLoading(false));
    }, [isOpen, tab]);

    const handleContactSubmit = async () => {
        if (!message.trim()) {
            setToast({ type: 'error', msg: 'Please write your message.' });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:3001/api/support/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, category, message }),
            });
            const data = await res.json();
            setToast({ type: data.success ? 'success' : 'error', msg: data.message, ticketId: data.ticketId });
            if (data.success) setMessage('');
        } catch {
            setToast({ type: 'error', msg: 'Could not connect to server.' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setToast(null), 5000);
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
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">Help & Support</h2>
                                    <p className="text-gray-400 text-xs">FAQs and contact our team</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors" aria-label="Close help and support">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-gray-800/50 mx-4 mt-4 rounded-xl p-1 gap-1">
                            {(['faq', 'contact'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${tab === t
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {t === 'faq' ? '❓ FAQs' : '📬 Contact Us'}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="max-h-[55vh] overflow-y-auto px-4 py-4">
                            {/* FAQ Tab */}
                            {tab === 'faq' && (
                                <div className="space-y-2">
                                    {faqLoading ? (
                                        <div className="py-12 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                                        </div>
                                    ) : faqs.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8 text-sm">No FAQs available.</p>
                                    ) : (
                                        faqs.map(faq => (
                                            <div
                                                key={faq.id}
                                                className="bg-gray-800/60 border border-gray-700/60 rounded-2xl overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                                    className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3 hover:bg-gray-700/30 transition-colors"
                                                >
                                                    <span className="text-white text-sm font-medium leading-snug">{faq.question}</span>
                                                    {openFaq === faq.id
                                                        ? <ChevronUp className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                                        : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                                                </button>
                                                <AnimatePresence>
                                                    {openFaq === faq.id && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: 'auto' }}
                                                            exit={{ height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <p className="px-4 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-700/60 pt-3">
                                                                {faq.answer}
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Contact Tab */}
                            {tab === 'contact' && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
                                        <MessageSquare className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                        <p className="text-purple-300 text-xs">We typically respond within 24 hours.</p>
                                    </div>

                                    <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                                    <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />

                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className={`${inputClass} appearance-none`}
                                        aria-label="Select issue category"
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c} className="bg-gray-800">{c}</option>
                                        ))}
                                    </select>

                                    <textarea
                                        placeholder="Describe your issue or question…"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        rows={4}
                                        className={`${inputClass} resize-none`}
                                    />

                                    <AnimatePresence>
                                        {toast && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`flex items-start gap-2 px-4 py-3 rounded-xl text-xs font-medium ${toast.type === 'success'
                                                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                                        : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                                    }`}
                                            >
                                                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p>{toast.msg}</p>
                                                    {toast.ticketId && (
                                                        <p className="mt-0.5 opacity-70">Ticket ID: {toast.ticketId}</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        onClick={handleContactSubmit}
                                        disabled={submitting}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold text-sm hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        {submitting ? 'Sending…' : 'Send Message'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-800">
                            <button onClick={onClose} className="w-full py-3 rounded-2xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors font-medium text-sm">
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
