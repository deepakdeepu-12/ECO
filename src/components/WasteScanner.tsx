import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Camera,
    RotateCcw,
    CheckCircle,
    AlertCircle,
    Recycle,
    Loader2,
    Zap,
    Info,
    Trash2,
    Leaf,
} from 'lucide-react';
import { addWasteRecycled } from '../lib/download';
import { CategoryBadge } from './CategoryBadge';

interface ClassificationResult {
    wasteType: string;
    category: string;
    recyclable: boolean;
    confidence: number;
    color: string;
    instructions: string[];
    tips: string;
    binColor: string;
    points: number;
}

interface WasteScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScanComplete?: (result: ClassificationResult) => void;
}

const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const categoryEmoji: Record<string, string> = {
    plastic: '🧴',
    paper: '📄',
    glass: '🫙',
    metal: '🥫',
    organic: '🌿',
    electronic: '📱',
    hazardous: '⚠️',
    textile: '👕',
    general: '🗑️',
};


export function WasteScanner({ isOpen, onClose, onScanComplete }: WasteScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [phase, setPhase] = useState<'camera' | 'analyzing' | 'result' | 'error'>('camera');
    const [cameraError, setCameraError] = useState<string>('');
    const [result, setResult] = useState<ClassificationResult | null>(null);
    const [capturedImage, setCapturedImage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [cameraReady, setCameraReady] = useState(false);

    const startCamera = useCallback(async () => {
        setCameraError('');
        setCameraReady(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setCameraReady(true);
                };
            }
        } catch {
            try {
                // Fall back to any available camera
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setCameraReady(true);
                    };
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Camera access denied';
                setCameraError(msg.includes('Permission') || msg.includes('denied')
                    ? 'Camera permission denied. Please allow camera access in your browser settings.'
                    : 'Could not access camera. Please ensure a camera is connected.');
            }
        }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setCameraReady(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setPhase('camera');
            setResult(null);
            setCapturedImage('');
            setErrorMessage('');
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen, startCamera, stopCamera]);

    const captureAndClassify = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(imageData);
        stopCamera();
        setPhase('analyzing');

        try {
            const response = await fetch(`${BACKEND_URL}/api/classify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData }),
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.error || json.message || 'Classification failed');
            }

            setResult(json.data);
            setPhase('result');
            
            // Track recycled waste if item is recyclable
            if (json.data.recyclable) {
                // Average waste item weight: 0.5 kg for recyclables
                addWasteRecycled(0.5);
            }
            
            onScanComplete?.(json.data);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Something went wrong';
            setErrorMessage(msg);
            setPhase('error');
        }
    }, [stopCamera, onScanComplete]);

    const handleScanAgain = () => {
        setPhase('camera');
        setResult(null);
        setCapturedImage('');
        setErrorMessage('');
        startCamera();
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
                onClick={(e) => e.target === e.currentTarget && handleClose()}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden w-full max-w-md shadow-2xl"
                    style={{ maxHeight: '90vh', overflowY: 'auto' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg leading-none">AI Waste Scanner</h2>
                                <p className="text-gray-400 text-xs mt-0.5">Powered by Gemini Vision AI</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            aria-label="Close scanner"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Camera Phase */}
                    {phase === 'camera' && (
                        <div>
                            <div className="relative bg-black aspect-[4/3]">
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    playsInline
                                    muted
                                />
                                <canvas ref={canvasRef} className="hidden" />

                                {/* Scanner overlay */}
                                {cameraReady && (
                                    <>
                                        {/* Corner markers */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="relative w-56 h-56">
                                                {/* Corners */}
                                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-400 rounded-tl-lg" />
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-400 rounded-tr-lg" />
                                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-400 rounded-bl-lg" />
                                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-400 rounded-br-lg" />
                                                {/* Scan line */}
                                                <motion.div
                                                    animate={{ y: ['0%', '90%', '0%'] }}
                                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                                                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                                                    style={{ top: '5%' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-3 px-4 text-center">
                                            <p className="text-white text-sm font-medium">Point camera at a waste item</p>
                                        </div>
                                    </>
                                )}

                                {!cameraReady && !cameraError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                                        <Loader2 className="w-10 h-10 animate-spin text-green-400" />
                                        <p className="text-sm text-gray-300">Starting camera...</p>
                                    </div>
                                )}

                                {cameraError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                                        <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                                            <AlertCircle className="w-7 h-7 text-red-400" />
                                        </div>
                                        <p className="text-white font-semibold">Camera Unavailable</p>
                                        <p className="text-gray-400 text-sm">{cameraError}</p>
                                        <button
                                            onClick={startCamera}
                                            className="mt-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-5">
                                <button
                                    onClick={captureAndClassify}
                                    disabled={!cameraReady}
                                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <Camera className="w-6 h-6" />
                                    Capture & Analyze
                                </button>
                                <p className="text-center text-gray-500 text-xs mt-3">
                                    AI will instantly identify waste type & recycling instructions
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Analyzing Phase */}
                    {phase === 'analyzing' && (
                        <div className="p-6">
                            {capturedImage && (
                                <div className="relative rounded-2xl overflow-hidden mb-5 aspect-[4/3]">
                                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-16 h-16 rounded-full border-4 border-gray-600 border-t-green-400"
                                        />
                                        <div className="text-center">
                                            <p className="text-white font-bold text-lg">Analyzing...</p>
                                            <p className="text-gray-300 text-sm">Gemini AI is classifying your waste</p>
                                        </div>
                                    </div>
                                    {/* Animated scan lines */}
                                    <motion.div
                                        animate={{ y: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-70 pointer-events-none"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                {['Detecting waste item...', 'Classifying material...', 'Generating recycling instructions...'].map(
                                    (step, i) => (
                                        <motion.div
                                            key={step}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.5 }}
                                            className="flex items-center gap-2 text-gray-400 text-sm"
                                        >
                                            <Loader2 className="w-4 h-4 animate-spin text-green-400 flex-shrink-0" />
                                            {step}
                                        </motion.div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Result Phase */}
                    {phase === 'result' && result && (
                        <div className="p-5 space-y-4">
                            {/* Captured image thumbnail */}
                            {capturedImage && (
                                <div className="relative rounded-2xl overflow-hidden h-32">
                                    <img src={capturedImage} alt="Scanned item" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                                        <span className="text-white font-bold text-base">{result.wasteType}</span>
                                        <span className="text-xs text-gray-300">{result.confidence}% confident</span>
                                    </div>
                                </div>
                            )}

                            {/* Points Earned */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-2xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">+{result.points} Green Points Earned!</p>
                                        <p className="text-gray-400 text-xs">Great job recycling responsibly</p>
                                    </div>
                                </div>
                                <span className="text-4xl">{categoryEmoji[result.category] || '♻️'}</span>
                            </motion.div>

                            {/* Classification Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-800/60 rounded-xl p-3">
                                    <p className="text-gray-400 text-xs mb-1">Category</p>
                                    <CategoryBadge category={result.category} color={result.color} />
                                </div>
                                <div className="bg-gray-800/60 rounded-xl p-3">
                                    <p className="text-gray-400 text-xs mb-1">Recyclable?</p>
                                    <div className={`flex items-center gap-1.5 text-sm font-semibold ${result.recyclable ? 'text-green-400' : 'text-red-400'}`}>
                                        {result.recyclable ? <CheckCircle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                        {result.recyclable ? 'Yes' : 'No'}
                                    </div>
                                </div>
                            </div>

                            {/* Bin Color */}
                            <div className="bg-gray-800/60 rounded-xl p-3 flex items-center gap-3">
                                <Recycle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400 text-xs">Disposal Bin</p>
                                    <p className="text-white text-sm font-semibold">{result.binColor}</p>
                                </div>
                            </div>

                            {/* Recycling Instructions */}
                            <div className="bg-gray-800/60 rounded-xl p-4">
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                    <Info className="w-4 h-4 text-green-400" />
                                    Recycling Instructions
                                </h4>
                                <ol className="space-y-2">
                                    {result.instructions.map((step, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm">
                                            <span className="w-5 h-5 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                                {i + 1}
                                            </span>
                                            <span className="text-gray-300">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Eco Tip */}
                            {result.tips && (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex gap-2">
                                    <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-emerald-300 text-xs leading-relaxed">{result.tips}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleScanAgain}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Scan Again
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Done
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error Phase */}
                    {phase === 'error' && (
                        <div className="p-6 text-center">
                            {capturedImage && (
                                <div className="relative rounded-2xl overflow-hidden h-32 mb-5">
                                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover opacity-40" />
                                </div>
                            )}
                            <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-7 h-7 text-red-400" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Classification Failed</h3>
                            <p className="text-gray-400 text-sm mb-2">{errorMessage}</p>
                            {errorMessage?.includes('GEMINI_API_KEY') || errorMessage?.includes('API key') ? (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-left mb-5">
                                    <p className="text-yellow-300 text-xs font-semibold mb-1">⚡ Setup Required:</p>
                                    <ol className="text-yellow-200 text-xs space-y-1 list-decimal list-inside">
                                        <li>Go to <span className="underline font-medium">aistudio.google.com/app/apikey</span></li>
                                        <li>Create a FREE API key (no credit card!)</li>
                                        <li>Add it to <code className="bg-yellow-900/40 px-1 rounded">backend/.env</code> as <code className="bg-yellow-900/40 px-1 rounded">GEMINI_API_KEY=...</code></li>
                                        <li>Restart the backend server</li>
                                    </ol>
                                </div>
                            ) : null}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleScanAgain}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Try Again
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
