import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    MapPin,
    Navigation,
    AlertCircle,
    RefreshCw,
    Trash2,
    Filter,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons broken by vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Bin {
    id: string;
    name: string;
    type: BinType;
    lat: number;
    lng: number;
    fillLevel: number;
    distance: number;
    address: string;
    lastUpdated: string;
    accepts: string[];
}

type BinType = 'general' | 'recycling' | 'organic' | 'hazardous' | 'electronic';
type FilterType = 'all' | BinType;

const BIN_COLORS: Record<BinType, string> = {
    general: '#6B7280',
    recycling: '#10B981',
    organic: '#F59E0B',
    hazardous: '#EF4444',
    electronic: '#8B5CF6',
};

const BIN_LABELS: Record<BinType, string> = {
    general: 'General Waste',
    recycling: '♻ Recycling',
    organic: '🌿 Organic',
    hazardous: '⚠ Hazardous',
    electronic: '📱 E-Waste',
};

const BIN_ACCEPTS: Record<BinType, string[]> = {
    general: ['Non-recyclable waste', 'Mixed rubbish'],
    recycling: ['Plastic', 'Paper', 'Glass', 'Metal', 'Cardboard'],
    organic: ['Food scraps', 'Garden waste', 'Biodegradable'],
    hazardous: ['Paint', 'Chemicals', 'Batteries', 'Medicine'],
    electronic: ['Phones', 'Computers', 'Cables', 'Appliances'],
};

function fillColor(level: number) {
    if (level < 50) return '#10B981';
    if (level < 80) return '#F59E0B';
    return '#EF4444';
}

function fillLabel(level: number) {
    if (level < 50) return 'Low';
    if (level < 80) return 'Medium';
    return 'High – Almost Full';
}

function generateBins(lat: number, lng: number): Bin[] {
    const types: BinType[] = ['recycling', 'general', 'organic', 'recycling', 'hazardous', 'electronic', 'recycling', 'general'];
    const names = [
        'City Recycling Hub', 'Main St Collection Point', 'Park Organic Bin',
        'Mall Recycling Station', 'Community Hazardous Drop-off', 'E-Waste Centre',
        'Corner Recycling Box', 'Street Waste Bin',
    ];
    const addresses = [
        '12 Main Street', '45 Park Avenue', 'Central Park, Gate 2',
        'Shopping Mall – Level B1', '78 Industrial Road', 'Community Centre, Hall A',
        'Junction of Oak & River St', '3 Market Square',
    ];

    return types.map((type, i) => {
        const angle = (i / types.length) * 2 * Math.PI;
        const radius = 0.003 + Math.random() * 0.007;
        const binLat = lat + radius * Math.cos(angle);
        const binLng = lng + radius * Math.sin(angle);
        const dLat = (binLat - lat) * 111000;
        const dLng = (binLng - lng) * 111000 * Math.cos((lat * Math.PI) / 180);
        const distance = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
        return {
            id: `bin-${i}`,
            name: names[i],
            type,
            lat: binLat,
            lng: binLng,
            fillLevel: Math.floor(Math.random() * 100),
            distance,
            address: addresses[i],
            lastUpdated: `${Math.floor(Math.random() * 55) + 1} min ago`,
            accepts: BIN_ACCEPTS[type],
        };
    }).sort((a, b) => a.distance - b.distance);
}

function createBinIcon(bin: Bin) {
    const color = BIN_COLORS[bin.type];
    const fc = fillColor(bin.fillLevel);
    return L.divIcon({
        className: '',
        html: `<div style="position:relative;width:36px;height:44px;cursor:pointer">
      <svg viewBox="0 0 36 44" width="36" height="44" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 12.67 18 26 18 26S36 30.67 36 18C36 8.06 27.94 0 18 0z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="18" cy="18" r="10" fill="white" opacity="0.2"/>
        <text x="18" y="23" text-anchor="middle" font-size="13" fill="white">🗑</text>
      </svg>
      <div style="position:absolute;top:-8px;right:-4px;background:${fc};color:white;font-size:9px;font-weight:700;padding:1px 4px;border-radius:8px;border:1px solid white;white-space:nowrap">${bin.fillLevel}%</div>
    </div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
    });
}

interface SmartBinLocatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SmartBinLocator({ isOpen, onClose }: SmartBinLocatorProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    const [status, setStatus] = useState<'idle' | 'locating' | 'ready' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [bins, setBins] = useState<Bin[]>([]);
    const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [showList, setShowList] = useState(false);
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

    const filteredBins = filter === 'all' ? bins : bins.filter(b => b.type === filter);

    const initMap = useCallback((lat: number, lng: number) => {
        if (!mapRef.current) return;
        if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; }

        const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
        L.circleMarker([lat, lng], {
            radius: 10, color: '#3B82F6', weight: 3, fillColor: '#3B82F6', fillOpacity: 0.3,
        }).addTo(map).bindTooltip('You are here');
        leafletMap.current = map;
    }, []);

    const plotBins = useCallback((binsToPlot: Bin[]) => {
        if (!leafletMap.current) return;
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        binsToPlot.forEach(bin => {
            const marker = L.marker([bin.lat, bin.lng], { icon: createBinIcon(bin) })
                .addTo(leafletMap.current!)
                .on('click', () => setSelectedBin(bin));
            markersRef.current.push(marker);
        });
    }, []);

    const locate = useCallback(() => {
        setStatus('locating');
        setErrorMsg('');
        setSelectedBin(null);

        const onSuccess = (lat: number, lng: number, demo = false) => {
            setUserCoords({ lat, lng });
            const generated = generateBins(lat, lng);
            setBins(generated);
            initMap(lat, lng);
            setTimeout(() => plotBins(generated), 150);
            setStatus('ready');
            if (demo) setErrorMsg('Using demo location (location permission denied)');
        };

        if (!navigator.geolocation) {
            onSuccess(28.6139, 77.2090, true);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => onSuccess(pos.coords.latitude, pos.coords.longitude),
            () => onSuccess(28.6139, 77.2090, true),
            { timeout: 8000, enableHighAccuracy: true }
        );
    }, [initMap, plotBins]);

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setSelectedBin(null);
            setFilter('all');
            locate();
        } else {
            if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; }
        }
    }, [isOpen, locate]);

    useEffect(() => {
        if (status === 'ready') plotBins(filteredBins);
    }, [filter, status, filteredBins, plotBins]);

    const handleFlyTo = (bin: Bin) => {
        leafletMap.current?.flyTo([bin.lat, bin.lng], 17, { duration: 0.8 });
        setSelectedBin(bin);
        setShowList(false);
    };

    if (!isOpen) return null;

    const filterOptions: { value: FilterType; label: string }[] = [
        { value: 'all', label: 'All Bins' },
        { value: 'recycling', label: '♻ Recycling' },
        { value: 'general', label: '🗑 General' },
        { value: 'organic', label: '🌿 Organic' },
        { value: 'hazardous', label: '⚠ Hazardous' },
        { value: 'electronic', label: '📱 E-Waste' },
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
                    style={{ maxWidth: 680, height: '88vh' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg leading-none">Smart Bin Locator</h2>
                                <p className="text-gray-400 text-xs mt-0.5">
                                    {status === 'ready' ? `${filteredBins.length} bins found nearby` : 'Finding nearby bins...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {status === 'ready' && (
                                <button onClick={locate} className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 transition-colors" title="Refresh">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={onClose} className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Demo warning */}
                    {errorMsg && (
                        <div className="mx-4 mt-2 flex-shrink-0 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            <p className="text-yellow-300 text-xs">{errorMsg}</p>
                        </div>
                    )}

                    {/* Filter bar */}
                    {status === 'ready' && (
                        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
                            {filterOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilter(opt.value)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === opt.value ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Map */}
                    <div className="relative flex-1 min-h-0">
                        {status === 'locating' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-gray-900">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-14 h-14 rounded-full border-4 border-gray-700 border-t-blue-400"
                                />
                                <div className="text-center">
                                    <p className="text-white font-semibold">Finding your location...</p>
                                    <p className="text-gray-400 text-sm mt-1">Allow location access for best results</p>
                                </div>
                            </div>
                        )}

                        <div ref={mapRef} className="w-full h-full" style={{ minHeight: 300 }} />

                        {/* Legend */}
                        {status === 'ready' && (
                            <div className="absolute top-2 left-2 bg-gray-900/90 backdrop-blur rounded-xl p-2 text-xs space-y-1 border border-gray-700 z-10">
                                {(Object.entries(BIN_COLORS) as [BinType, string][]).map(([type, color]) => (
                                    <div key={type} className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                        <span className="text-gray-300 capitalize">{type}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* My Location button */}
                        {status === 'ready' && userCoords && (
                            <button
                                onClick={() => leafletMap.current?.flyTo([userCoords.lat, userCoords.lng], 15, { duration: 0.8 })}
                                className="absolute bottom-4 right-3 bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-xl shadow-lg transition-colors flex items-center gap-1.5 text-xs font-semibold z-10"
                            >
                                <Navigation className="w-4 h-4" />
                                My Location
                            </button>
                        )}
                    </div>

                    {/* Bin list toggle */}
                    {status === 'ready' && (
                        <div className="flex-shrink-0 border-t border-gray-800">
                            <button
                                onClick={() => setShowList(v => !v)}
                                className="w-full flex items-center justify-between px-5 py-3 text-white hover:bg-gray-800/50 transition-colors"
                            >
                                <span className="font-semibold text-sm flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-blue-400" />
                                    Nearby Bins ({filteredBins.length})
                                </span>
                                {showList ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
                            </button>

                            <AnimatePresence>
                                {showList && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="max-h-48 overflow-y-auto divide-y divide-gray-800">
                                            {filteredBins.map(bin => (
                                                <button
                                                    key={bin.id}
                                                    onClick={() => handleFlyTo(bin)}
                                                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-800/60 transition-colors text-left"
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                                        style={{ backgroundColor: BIN_COLORS[bin.type] + '33' }}
                                                    >
                                                        <span>🗑</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-xs font-semibold truncate">{bin.name}</p>
                                                        <p className="text-gray-500 text-xs truncate">{bin.address} · {bin.distance}m</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                                        <span className="text-xs font-bold" style={{ color: fillColor(bin.fillLevel) }}>{bin.fillLevel}%</span>
                                                        <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{ width: `${bin.fillLevel}%`, backgroundColor: fillColor(bin.fillLevel) }}
                                                            />
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Selected Bin Detail */}
                    <AnimatePresence>
                        {selectedBin && (
                            <motion.div
                                initial={{ y: 60, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 60, opacity: 0 }}
                                className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t-2 rounded-t-3xl p-5 shadow-2xl z-20"
                                style={{ borderColor: BIN_COLORS[selectedBin.type] }}
                            >
                                <button onClick={() => setSelectedBin(null)} className="absolute top-3 right-4 text-gray-500 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-start gap-3 mb-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                                        style={{ backgroundColor: BIN_COLORS[selectedBin.type] + '33' }}
                                    >
                                        🗑
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold text-base truncate">{selectedBin.name}</h3>
                                        <p className="text-gray-400 text-xs">{selectedBin.address}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className="text-xs font-semibold px-2 py-0.5 rounded-lg capitalize"
                                                style={{ backgroundColor: BIN_COLORS[selectedBin.type] + '22', color: BIN_COLORS[selectedBin.type] }}
                                            >
                                                {BIN_LABELS[selectedBin.type]}
                                            </span>
                                            <span className="text-gray-500 text-xs">{selectedBin.distance}m away</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fill level */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-gray-400 text-xs flex items-center gap-1">
                                            <Trash2 className="w-3.5 h-3.5" /> Fill Level
                                        </span>
                                        <span className="text-xs font-bold" style={{ color: fillColor(selectedBin.fillLevel) }}>
                                            {selectedBin.fillLevel}% — {fillLabel(selectedBin.fillLevel)}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${selectedBin.fillLevel}%` }}
                                            transition={{ duration: 0.6 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: fillColor(selectedBin.fillLevel) }}
                                        />
                                    </div>
                                    <p className="text-gray-600 text-xs mt-1">Updated {selectedBin.lastUpdated}</p>
                                </div>

                                {/* Accepts */}
                                <div>
                                    <p className="text-gray-400 text-xs mb-2">Accepts:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedBin.accepts.map(item => (
                                            <span key={item} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-lg border border-gray-700">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
