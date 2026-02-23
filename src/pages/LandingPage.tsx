import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Download, Play, Camera, MapPin, Gift, BarChart3, Recycle, Users,
  TrendingUp, CheckCircle, Smartphone, Cpu, Cloud, Database, Globe, Zap,
  Shield, Award, Target, TreeDeciduous, Loader2, Menu, X, Star, ArrowRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { VideoModal }          from '../components/VideoModal';
import { WasteScanner }        from '../components/WasteScanner';
import { SmartBinLocator }     from '../components/SmartBinLocator';
import { RecyclingRewards }    from '../components/RecyclingRewards';
import { ImpactDashboard }     from '../components/ImpactDashboard';
import { CommunityChallenges } from '../components/CommunityChallenges';
import { IllegalDumpReporting } from '../components/IllegalDumpReporting';
import { downloadApp, getDownloadCount, detectDevice } from '../lib/download';

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = 'home' | 'signin' | 'signup' | 'dashboard';

interface Props {
  onNavigate: (page: Page) => void;
}

// ─── Chart data ───────────────────────────────────────────────────────────────

const impactData = [
  { month: 'Jan', waste: 120, recycled: 45 },
  { month: 'Feb', waste: 115, recycled: 52 },
  { month: 'Mar', waste: 108, recycled: 61 },
  { month: 'Apr', waste: 95,  recycled: 72 },
  { month: 'May', waste: 85,  recycled: 85 },
  { month: 'Jun', waste: 72,  recycled: 98 },
];

const carbonData = [
  { month: 'Jan', saved: 12 },
  { month: 'Feb', saved: 19 },
  { month: 'Mar', saved: 28 },
  { month: 'Apr', saved: 42 },
  { month: 'May', saved: 58 },
  { month: 'Jun', saved: 78 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function LandingPage({ onNavigate }: Props) {
  const [isVideoModalOpen,    setIsVideoModalOpen]    = useState(false);
  const [isWasteScannerOpen,  setIsWasteScannerOpen]  = useState(false);
  const [isBinLocatorOpen,    setIsBinLocatorOpen]    = useState(false);
  const [isRewardsOpen,       setIsRewardsOpen]       = useState(false);
  const [isImpactOpen,        setIsImpactOpen]        = useState(false);
  const [isChallengesOpen,    setIsChallengesOpen]    = useState(false);
  const [isDumpReportOpen,    setIsDumpReportOpen]    = useState(false);
  const [isDownloading,       setIsDownloading]       = useState(false);
  const [downloadCount,       setDownloadCount]       = useState(() => getDownloadCount());
  const [mobileMenuOpen,      setMobileMenuOpen]      = useState(false);
  const userDevice = detectDevice();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const result = await downloadApp();
      
      if (result.success) {
        setDownloadCount(prev => prev + 1);
        // Download happens instantly, just show brief success message
        setTimeout(() => {
          alert('✅ Download complete! Check your downloads folder.\n\nOpen the file to access EcoSync.');
        }, 100);
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      {/* Modals */}
      <VideoModal           isOpen={isVideoModalOpen}   onClose={() => setIsVideoModalOpen(false)} />
      <WasteScanner         isOpen={isWasteScannerOpen} onClose={() => setIsWasteScannerOpen(false)} />
      <SmartBinLocator      isOpen={isBinLocatorOpen}   onClose={() => setIsBinLocatorOpen(false)} />
      <RecyclingRewards     isOpen={isRewardsOpen}      onClose={() => setIsRewardsOpen(false)} />
      <ImpactDashboard      isOpen={isImpactOpen}       onClose={() => setIsImpactOpen(false)} />
      <CommunityChallenges  isOpen={isChallengesOpen}   onClose={() => setIsChallengesOpen(false)} />
      <IllegalDumpReporting isOpen={isDumpReportOpen}   onClose={() => setIsDumpReportOpen(false)} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EcoSync</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features"   className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#technology" className="text-gray-300 hover:text-white transition-colors">Technology</a>
            <a href="#impact"     className="text-gray-300 hover:text-white transition-colors">Impact</a>
            <a href="#download"   className="text-gray-300 hover:text-white transition-colors">Download</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => onNavigate('signin')} className="text-gray-300 hover:text-white transition-colors">
              Sign In
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              Get Started
            </button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900/95 border-t border-gray-800"
            >
              <nav className="flex flex-col p-4 gap-4">
                <a href="#features"   className="text-gray-300 hover:text-white transition-colors py-2">Features</a>
                <a href="#technology" className="text-gray-300 hover:text-white transition-colors py-2">Technology</a>
                <a href="#impact"     className="text-gray-300 hover:text-white transition-colors py-2">Impact</a>
                <a href="#download"   className="text-gray-300 hover:text-white transition-colors py-2">Download</a>
                <div className="border-t border-gray-800 pt-4 flex flex-col gap-3">
                  <button
                    onClick={() => { onNavigate('signin'); setMobileMenuOpen(false); }}
                    className="text-gray-300 hover:text-white transition-colors py-2 text-left"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-semibold"
                  >
                    Get Started
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm mb-6">
                <Recycle className="w-4 h-4" />
                AI-Powered Waste Management
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Smart Waste Management for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                  Sustainable Cities
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Join the revolution in waste management. Use AI to classify waste, earn rewards for recycling,
                and track your environmental impact in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 disabled:opacity-70"
                >
                  {isDownloading ? (
                    <><Loader2 className="w-6 h-6 animate-spin" />Downloading...</>
                  ) : (
                    <><Download className="w-6 h-6" />Download App</>
                  )}
                </button>
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all border border-white/20"
                >
                  <Play className="w-6 h-6" />Watch Demo
                </button>
              </div>
              <div className="flex flex-wrap gap-8">
                <div><p className="text-3xl font-bold text-white">{downloadCount.toLocaleString()}+</p><p className="text-gray-400">Downloads</p></div>
                <div><p className="text-3xl font-bold text-white">50K+</p><p className="text-gray-400">Active Users</p></div>
                <div><p className="text-3xl font-bold text-white">2.5M kg</p><p className="text-gray-400">Waste Recycled</p></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-[3rem] blur-3xl opacity-30" />
                <div className="relative bg-gray-800 rounded-[3rem] p-3 border border-gray-700 shadow-2xl">
                  <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden w-72 h-[580px]">
                    <div className="h-full bg-gradient-to-br from-green-900 to-gray-900 p-6 flex flex-col">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-white text-sm">9:41</span>
                        <div className="flex gap-1"><div className="w-4 h-2 bg-white rounded-sm" /></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">EcoSync</p>
                            <p className="text-green-400 text-sm">1,250 Points</p>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-4 text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Camera className="w-10 h-10 text-white" />
                          </div>
                          <p className="text-white font-semibold">Scan Waste</p>
                          <p className="text-gray-400 text-sm">AI Classification</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <Recycle className="w-6 h-6 text-green-400 mb-2" />
                            <p className="text-white font-bold">156</p>
                            <p className="text-gray-400 text-xs">Recycled</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <TreeDeciduous className="w-6 h-6 text-emerald-400 mb-2" />
                            <p className="text-white font-bold">89kg</p>
                            <p className="text-gray-400 text-xs">CO₂ Saved</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-around pt-4 border-t border-gray-700">
                        <div className="text-green-400"><Leaf className="w-6 h-6" /></div>
                        <div className="text-gray-500"><MapPin className="w-6 h-6" /></div>
                        <div className="text-gray-500"><Gift className="w-6 h-6" /></div>
                        <div className="text-gray-500"><BarChart3 className="w-6 h-6" /></div>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -left-16 top-20 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle className="w-5 h-5 text-white" /></div>
                    <div><p className="text-white text-sm font-semibold">Plastic Detected</p><p className="text-green-400 text-xs">+15 Points</p></div>
                  </div>
                </motion.div>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="absolute -right-12 bottom-32 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center"><Award className="w-5 h-5 text-white" /></div>
                    <div><p className="text-white text-sm font-semibold">Badge Earned!</p><p className="text-purple-400 text-xs">Eco Warrior</p></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Powerful Features for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Sustainable Living</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Everything you need to reduce waste, earn rewards, and track your environmental impact</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Camera,  title: 'AI Waste Classification',  desc: 'Scan any item and let our AI instantly identify the waste type and recycling instructions',            color: 'from-green-500 to-emerald-600',  onClick: () => setIsWasteScannerOpen(true) },
              { icon: MapPin,  title: 'Smart Bin Locator',        desc: 'Find the nearest recycling bins and collection points with real-time fill-level monitoring',         color: 'from-blue-500 to-cyan-600',      onClick: () => setIsBinLocatorOpen(true) },
              { icon: Gift,    title: 'Recycling Rewards',        desc: 'Earn green points for every item recycled and redeem them for eco-friendly products',                color: 'from-purple-500 to-pink-600',    onClick: () => setIsRewardsOpen(true) },
              { icon: BarChart3, title: 'Impact Dashboard',       desc: 'Track your carbon footprint reduction and see your contribution to a cleaner planet',               color: 'from-orange-500 to-red-600',     onClick: () => setIsImpactOpen(true) },
              { icon: Users,   title: 'Community Challenges',     desc: 'Join neighborhood challenges and compete on leaderboards for exclusive rewards',                    color: 'from-teal-500 to-green-600',     onClick: () => setIsChallengesOpen(true) },
              { icon: Target,  title: 'Illegal Dump Reporting',   desc: 'Report illegal dumping sites and help keep your community clean',                                   color: 'from-red-500 to-orange-600',     onClick: () => setIsDumpReportOpen(true) },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                onClick={feature.onClick}
                className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-green-500/50 transition-all group cursor-pointer"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
                <p className="text-green-400 text-sm font-semibold mt-3 flex items-center gap-1">Try it now →</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="technology" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Built with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Cutting-Edge Technology</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Powered by advanced AI, IoT sensors, and cloud infrastructure for seamless performance</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Smartphone, title: 'Mobile App',      items: ['React Native', 'Flutter', 'Native APIs'] },
              { icon: Cpu,        title: 'AI Engine',       items: ['TensorFlow', 'Computer Vision', 'Edge ML'] },
              { icon: Cloud,      title: 'Cloud Platform',  items: ['AWS', 'Firebase', 'Kubernetes'] },
              { icon: Database,   title: 'Data Layer',      items: ['MongoDB', 'PostgreSQL', 'Redis'] },
            ].map((tech, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <tech.icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{tech.title}</h3>
                <ul className="space-y-2">
                  {tech.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />{item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Real{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Environmental Impact</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">See how our community is making a difference in waste reduction and carbon savings</p>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Waste vs Recycling Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={impactData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="waste"    stroke="#EF4444" fill="#EF444433" name="Waste (tons)" />
                  <Area type="monotone" dataKey="recycled" stroke="#10B981" fill="#10B98133" name="Recycled (tons)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">CO₂ Emissions Saved (tons)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={carbonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="saved" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2 }} name="CO₂ Saved" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {[
              { value: '45%',  label: 'Landfill Reduction',       icon: TrendingUp },
              { value: '3x',   label: 'Recycling Rate Increase',  icon: Recycle },
              { value: '78K',  label: 'Active Citizens',          icon: Users },
              { value: '$2.5M',label: 'Cost Savings',             icon: Award },
            ].map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 text-center">
                <stat.icon className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur border border-green-500/30 rounded-3xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
            <p className="text-gray-300 text-lg mb-2 max-w-xl mx-auto">
              Download EcoSync today and join thousands of eco-warriors making our planet cleaner, one scan at a time.
            </p>
            {userDevice.isAndroid && (
              <p className="text-green-400 text-sm mb-6">
                📱 Android device detected - Download the app package now!
              </p>
            )}
            {userDevice.isIOS && (
              <p className="text-blue-400 text-sm mb-6">
                📱 iOS device detected - Download the app package now!
              </p>
            )}
            {!userDevice.isMobile && (
              <p className="text-gray-400 text-sm mb-6">
                💻 Download the web app package for easy mobile access
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all shadow-lg disabled:opacity-70"
              >
                {isDownloading ? (
                  <><Loader2 className="w-6 h-6 animate-spin" />Downloading...</>
                ) : (
                  <><Download className="w-6 h-6" />
                    {userDevice.isMobile ? 'Download App Package' : 'Download App Package'}
                  </>
                )}
              </button>
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                <Play className="w-6 h-6" />Watch Demo
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              <div className="flex items-center gap-2"><Shield className="w-5 h-5" /><span>Secure &amp; Private</span></div>
              <div className="flex items-center gap-2"><Zap    className="w-5 h-5" /><span>Fast &amp; Lightweight</span></div>
              <div className="flex items-center gap-2"><Globe  className="w-5 h-5" /><span>Works Offline</span></div>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
              </div>
              <span className="text-white font-semibold">4.9</span>
              <span className="text-gray-400">({downloadCount.toLocaleString()}+ downloads)</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">EcoSync</span>
              </div>
              <p className="text-gray-400">AI-powered waste management for a sustainable future.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features"   className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#technology" className="hover:text-white transition-colors">Technology</a></li>
                <li><a href="#download"   className="hover:text-white transition-colors">Download</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">Stay updated with eco-tips and app updates.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Enter email" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2026 EcoSync. All rights reserved.</p>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
