import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, AlertTriangle, MapPin, Camera, CheckCircle,
    Clock, ChevronRight, Zap, FileText, Navigation,
    Upload, Eye, Shield,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
type WasteType = 'plastic' | 'construction' | 'chemical' | 'organic' | 'mixed' | 'electronic';
type Severity = 'low' | 'medium' | 'high';
type ReportStatus = 'pending' | 'reviewing' | 'resolved';
type Tab = 'report' | 'myreports' | 'community';

interface Report {
    id: string;
    title: string;
    location: string;
    wasteType: WasteType;
    severity: Severity;
    status: ReportStatus;
    date: string;
    pointsEarned: number;
    description: string;
    upvotes: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const INITIAL_MY_REPORTS: Report[] = [
    { id: 'r1', title: 'Plastic heap near river bank', location: 'Yamuna Ghat, Sector 12', wasteType: 'plastic', severity: 'high', status: 'reviewing', date: '3 days ago', pointsEarned: 50, description: 'Large pile of plastic bottles and bags dumped near the river.', upvotes: 12 },
    { id: 'r2', title: 'Construction debris on roadside', location: 'MG Road, Block C', wasteType: 'construction', severity: 'medium', status: 'resolved', date: '1 week ago', pointsEarned: 50, description: 'Broken bricks and cement debris blocking footpath.', upvotes: 8 },
];

const COMMUNITY_REPORTS: Report[] = [
    { id: 'c1', title: 'Chemical drums abandoned in park', location: 'Central Park, Zone 3', wasteType: 'chemical', severity: 'high', status: 'reviewing', date: '1 day ago', pointsEarned: 50, description: 'Suspicious unmarked drums leaking liquid near the children\'s area.', upvotes: 34 },
    { id: 'c2', title: 'E-waste pile behind market', location: 'Lajpat Nagar Market', wasteType: 'electronic', severity: 'medium', status: 'pending', date: '2 days ago', pointsEarned: 50, description: 'Old TVs, computers and cables dumped behind the market building.', upvotes: 19 },
    { id: 'c3', title: 'Mixed garbage on vacant plot', location: 'Sector 22, Plot 45', wasteType: 'mixed', severity: 'low', status: 'resolved', date: '5 days ago', pointsEarned: 50, description: 'Mixed household garbage dumped on an empty plot.', upvotes: 6 },
];

const WASTE_TYPES: { value: WasteType; label: string; emoji: string }[] = [
    { value: 'plastic', label: 'Plastic', emoji: '🧴' },
    { value: 'construction', label: 'Construction', emoji: '🧱' },
    { value: 'chemical', label: 'Chemical', emoji: '☣️' },
    { value: 'organic', label: 'Organic', emoji: '🌿' },
    { value: 'mixed', label: 'Mixed', emoji: '🗑️' },
    { value: 'electronic', label: 'Electronic', emoji: '💻' },
];

const SEVERITY_INFO: Record<Severity, { color: string; bg: string; label: string }> = {
    low: { color: '#10B981', bg: '#10B98122', label: 'Low' },
    medium: { color: '#F59E0B', bg: '#F59E0B22', label: 'Medium' },
    high: { color: '#EF4444', bg: '#EF444422', label: 'High' },
};

const STATUS_INFO: Record<ReportStatus, { color: string; label: string; icon: typeof Clock }> = {
    pending: { color: '#6B7280', label: 'Pending', icon: Clock },
    reviewing: { color: '#F59E0B', label: 'Reviewing', icon: Eye },
    resolved: { color: '#10B981', label: 'Resolved', icon: CheckCircle },
};

// ── Component ──────────────────────────────────────────────────────────────
interface IllegalDumpReportingProps {
    isOpen: boolean;
    onClose: () => void;
}

export function IllegalDumpReporting({ isOpen, onClose }: IllegalDumpReportingProps) {
    const [tab, setTab] = useState<Tab>('report');
    const [myReports, setMyReports] = useState<Report[]>(INITIAL_MY_REPORTS);
    const [communityReports, setCommunityReports] = useState<Report[]>(COMMUNITY_REPORTS);

    // Form state
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [wasteType, setWasteType] = useState<WasteType | ''>('');
    const [severity, setSeverity] = useState<Severity | ''>('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [locating, setLocating] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleDetectLocation = useCallback(() => {
        setLocating(true);
        navigator.geolocation?.getCurrentPosition(
            () => {
                setLocation('Near your current location (GPS detected)');
                setLocating(false);
            },
            () => {
                setLocation('Location unavailable – please enter manually');
                setLocating(false);
            },
            { timeout: 6000 }
        );
    }, []);

    const handleSubmit = () => {
        if (!description.trim() || !location.trim() || !wasteType || !severity) return;
        const newReport: Report = {
            id: `r${Date.now()}`,
            title: description.slice(0, 45) + (description.length > 45 ? '…' : ''),
            location,
            wasteType: wasteType as WasteType,
            severity: severity as Severity,
            status: 'pending',
            date: 'Just now',
            pointsEarned: 50,
            description,
            upvotes: 0,
        };
        setMyReports(prev => [newReport, ...prev]);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setDescription('');
            setLocation('');
            setWasteType('');
            setSeverity('');
            setPhotoPreview(null);
            setTab('myreports');
        }, 2200);
    };

    const handleUpvote = (id: string) => {
        setCommunityReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
    };

    const canSubmit = description.trim() && location.trim() && wasteType && severity;

    if (!isOpen) return null;

    const TABS: { id: Tab; label: string; icon: typeof Camera }[] = [
        { id: 'report', label: 'Report', icon: Camera },
        { id: 'myreports', label: 'My Reports', icon: FileText },
        { id: 'community', label: 'Community', icon: Shield },
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
                    {/* Header */}
                    <div className="flex-shrink-0 bg-gradient-to-br from-red-900/40 to-orange-900/20 border-b border-gray-800 px-5 pt-4 pb-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg leading-none">Illegal Dump Reporting</h2>
                                    <p className="text-gray-400 text-xs mt-0.5">Help keep your community clean · Earn 50 GP per report</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-9 h-9 bg-gray-800/60 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-t border-gray-800">
                            {TABS.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all ${tab === t.id ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    <t.icon className="w-3.5 h-3.5" />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">

                        {/* ── REPORT FORM ── */}
                        {tab === 'report' && (
                            submitted ? (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-72 gap-4 text-center"
                                >
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-10 h-10 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-lg">Report Submitted!</p>
                                        <p className="text-gray-400 text-sm mt-1">Thank you for helping keep the community clean.</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-3">
                                        <Zap className="w-5 h-5 text-green-400" />
                                        <span className="text-green-300 font-bold text-lg">+50 Green Points Earned!</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Info banner */}
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 flex items-center gap-2.5">
                                        <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                        <p className="text-orange-300 text-xs">For emergencies or hazardous chemicals, call your local authorities immediately.</p>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="text-gray-300 text-sm font-semibold mb-2 block">📍 Location *</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={location}
                                                onChange={e => setLocation(e.target.value)}
                                                placeholder="Enter address or landmark…"
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                                            />
                                            <button
                                                onClick={handleDetectLocation}
                                                disabled={locating}
                                                className="flex-shrink-0 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl px-3 flex items-center gap-1.5 text-red-400 text-xs font-semibold transition-all"
                                            >
                                                <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                                                {locating ? 'Detecting…' : 'GPS'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Waste type */}
                                    <div>
                                        <label className="text-gray-300 text-sm font-semibold mb-2 block">🗑️ Waste Type *</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {WASTE_TYPES.map(w => (
                                                <button
                                                    key={w.value}
                                                    onClick={() => setWasteType(w.value)}
                                                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-semibold transition-all ${wasteType === w.value
                                                            ? 'border-red-500 bg-red-500/20 text-red-300'
                                                            : 'border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-600 hover:text-white'
                                                        }`}
                                                >
                                                    <span className="text-xl">{w.emoji}</span>
                                                    {w.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Severity */}
                                    <div>
                                        <label className="text-gray-300 text-sm font-semibold mb-2 block">⚠️ Severity *</label>
                                        <div className="flex gap-2">
                                            {(['low', 'medium', 'high'] as Severity[]).map(s => {
                                                const info = SEVERITY_INFO[s];
                                                return (
                                                    <button
                                                        key={s}
                                                        onClick={() => setSeverity(s)}
                                                        className="flex-1 py-2.5 rounded-xl border text-sm font-bold capitalize transition-all"
                                                        style={{
                                                            borderColor: severity === s ? info.color : '#374151',
                                                            backgroundColor: severity === s ? info.bg : 'transparent',
                                                            color: severity === s ? info.color : '#9CA3AF',
                                                        }}
                                                    >
                                                        {s}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="text-gray-300 text-sm font-semibold mb-2 block">📝 Description *</label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Describe what you see — type of waste, approximate amount, accessibility…"
                                            rows={3}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                                        />
                                    </div>

                                    {/* Photo upload */}
                                    <div>
                                        <label className="text-gray-300 text-sm font-semibold mb-2 block">📷 Photo (optional)</label>
                                        <input type="file" accept="image/*" ref={fileRef} onChange={handlePhoto} className="hidden" />
                                        {photoPreview ? (
                                            <div className="relative rounded-2xl overflow-hidden border border-gray-700">
                                                <img src={photoPreview} alt="preview" className="w-full h-36 object-cover" />
                                                <button
                                                    onClick={() => setPhotoPreview(null)}
                                                    className="absolute top-2 right-2 w-7 h-7 bg-gray-900/80 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => fileRef.current?.click()}
                                                className="w-full h-28 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-red-500/50 hover:text-gray-400 transition-all"
                                            >
                                                <Upload className="w-6 h-6" />
                                                <span className="text-xs">Tap to upload a photo</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit}
                                        className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${canSubmit
                                                ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700 active:scale-95'
                                                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                        Submit Report · Earn 50 GP
                                    </button>
                                </>
                            )
                        )}

                        {/* ── MY REPORTS ── */}
                        {tab === 'myreports' && (
                            <>
                                <div className="bg-gradient-to-r from-red-900/30 to-orange-900/20 border border-red-700/30 rounded-2xl p-4 flex items-center gap-3">
                                    <FileText className="w-7 h-7 text-red-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-red-300 font-bold text-sm">{myReports.length} Reports Submitted</p>
                                        <p className="text-gray-400 text-xs mt-0.5">{myReports.length * 50} GP earned from reporting</p>
                                    </div>
                                </div>

                                {myReports.length === 0 ? (
                                    <div className="text-center py-12">
                                        <AlertTriangle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                        <p className="text-gray-500">No reports yet</p>
                                        <p className="text-gray-600 text-sm mt-1">Switch to Report tab to submit your first one!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {myReports.map((r, i) => {
                                            const sev = SEVERITY_INFO[r.severity];
                                            const sta = STATUS_INFO[r.status];
                                            return (
                                                <motion.div
                                                    key={r.id}
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.06 }}
                                                    className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4"
                                                >
                                                    <div className="flex items-start gap-3 mb-2">
                                                        <span className="text-xl flex-shrink-0">{WASTE_TYPES.find(w => w.value === r.wasteType)?.emoji}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-semibold text-sm">{r.title}</p>
                                                            <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                                                                <MapPin className="w-3 h-3" /> {r.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ backgroundColor: sev.bg, color: sev.color }}>
                                                            {sev.label}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1"
                                                            style={{ backgroundColor: sta.color + '22', color: sta.color }}>
                                                            <sta.icon className="w-3 h-3" /> {sta.label}
                                                        </span>
                                                        <span className="text-gray-600 text-xs ml-auto">{r.date}</span>
                                                        <span className="text-green-400 text-xs font-bold">+{r.pointsEarned} GP</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── COMMUNITY ── */}
                        {tab === 'community' && (
                            <>
                                <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-700/30 rounded-2xl p-4 flex items-center gap-3">
                                    <Shield className="w-7 h-7 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-blue-300 font-bold text-sm">Community Watch</p>
                                        <p className="text-gray-400 text-xs mt-0.5">Upvote reports to prioritise cleanup action</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {communityReports.map((r, i) => {
                                        const sev = SEVERITY_INFO[r.severity];
                                        const sta = STATUS_INFO[r.status];
                                        return (
                                            <motion.div
                                                key={r.id}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.06 }}
                                                className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4"
                                            >
                                                <div className="flex items-start gap-3 mb-2">
                                                    <span className="text-xl flex-shrink-0">{WASTE_TYPES.find(w => w.value === r.wasteType)?.emoji}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-semibold text-sm">{r.title}</p>
                                                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                                                            <MapPin className="w-3 h-3" /> {r.location}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 text-xs mb-3 leading-relaxed">{r.description}</p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ backgroundColor: sev.bg, color: sev.color }}>
                                                        {sev.label}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1"
                                                        style={{ backgroundColor: sta.color + '22', color: sta.color }}>
                                                        <sta.icon className="w-3 h-3" /> {sta.label}
                                                    </span>
                                                    <span className="text-gray-600 text-xs">{r.date}</span>
                                                    <button
                                                        onClick={() => handleUpvote(r.id)}
                                                        className="ml-auto flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                                                    >
                                                        👍 {r.upvotes}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
