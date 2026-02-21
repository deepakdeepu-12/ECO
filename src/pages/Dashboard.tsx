import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  Home,
  Camera,
  Map,
  Gift,
  User,
  LogOut,
  Recycle,
  TrendingUp,
  Award,
  Target,
  ChevronRight,
  Zap,
  TreeDeciduous
} from 'lucide-react';
import { getCurrentUser, signOut, User as UserType } from '../lib/auth';
import { WasteScanner } from '../components/WasteScanner';
import { SmartBinLocator } from '../components/SmartBinLocator';
import { RecyclingRewards } from '../components/RecyclingRewards';
import { ImpactDashboard } from '../components/ImpactDashboard';
import { CommunityChallenges } from '../components/CommunityChallenges';
import { IllegalDumpReporting } from '../components/IllegalDumpReporting';
import { ProfileDashboard } from '../components/ProfileDashboard';

interface DashboardProps {
  onSignOut: () => void;
}

export function Dashboard({ onSignOut }: DashboardProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isWasteScannerOpen, setIsWasteScannerOpen] = useState(false);
  const [isBinLocatorOpen, setIsBinLocatorOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);
  const [isDumpReportOpen, setIsDumpReportOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState([
    { type: 'recycle', item: 'Plastic Bottle', points: '+15', time: '2 hours ago' },
    { type: 'recycle', item: 'Cardboard Box', points: '+25', time: '5 hours ago' },
    { type: 'challenge', item: 'Weekly Challenge Complete', points: '+100', time: '1 day ago' },
    { type: 'recycle', item: 'Glass Jar', points: '+20', time: '2 days ago' },
  ]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleSignOut = () => {
    signOut();
    onSignOut();
  };

  const handleScanComplete = (result: { wasteType: string; points: number }) => {
    setUser(prev => prev ? { ...prev, greenPoints: prev.greenPoints + result.points, totalRecycled: prev.totalRecycled + 1 } : prev);
    setRecentActivity(prev => [
      { type: 'recycle', item: result.wasteType, points: `+${result.points}`, time: 'Just now' },
      ...prev.slice(0, 3),
    ]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = [
    { label: 'Green Points', value: user.greenPoints.toLocaleString(), icon: Award, color: 'from-green-500 to-emerald-600' },
    { label: 'Items Recycled', value: user.totalRecycled.toString(), icon: Recycle, color: 'from-blue-500 to-cyan-600' },
    { label: 'CO₂ Saved (kg)', value: user.carbonSaved.toFixed(1), icon: TreeDeciduous, color: 'from-purple-500 to-pink-600' },
  ];

  const quickActions = [
    { label: 'Scan Waste', icon: Camera, color: 'bg-green-500', onClick: () => setIsWasteScannerOpen(true) },
    { label: 'Find Bins', icon: Map, color: 'bg-blue-500', onClick: () => setIsBinLocatorOpen(true) },
    { label: 'Rewards', icon: Gift, color: 'bg-purple-500', onClick: () => setIsRewardsOpen(true) },
    { label: 'Challenges', icon: Target, color: 'bg-orange-500', onClick: () => setIsChallengesOpen(true) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <WasteScanner
        isOpen={isWasteScannerOpen}
        onClose={() => setIsWasteScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />
      <SmartBinLocator
        isOpen={isBinLocatorOpen}
        onClose={() => setIsBinLocatorOpen(false)}
      />
      <RecyclingRewards isOpen={isRewardsOpen} onClose={() => setIsRewardsOpen(false)} userPoints={user?.greenPoints ?? 1250} />
      <ImpactDashboard isOpen={isImpactOpen} onClose={() => setIsImpactOpen(false)} carbonSaved={user?.carbonSaved ?? 48.9} itemsRecycled={user?.totalRecycled ?? 142} />
      <CommunityChallenges isOpen={isChallengesOpen} onClose={() => setIsChallengesOpen(false)} />
      <IllegalDumpReporting isOpen={isDumpReportOpen} onClose={() => setIsDumpReportOpen(false)} />
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EcoSync</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-full">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold text-sm">{user.greenPoints} GP</span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {activeTab === 'profile' ? (
          <ProfileDashboard
            user={user}
            onSignOut={handleSignOut}
            onUserUpdate={(updates) => setUser(prev => prev ? { ...prev, ...updates } : prev)}
          />
        ) : (
          <>
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-400">Let's make today sustainable</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-5 hover:bg-gray-700/50 transition-all group cursor-pointer"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white font-medium text-sm">{action.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Weekly Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Weekly Goal Progress</h2>
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400">Recycle 20 items this week</span>
                  <span className="text-green-400 font-semibold">12/20</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  />
                </div>
                <p className="text-gray-500 text-sm mt-2">8 more items to earn 200 bonus points!</p>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.type === 'recycle' ? 'bg-green-500/20' : 'bg-purple-500/20'
                        }`}>
                        {activity.type === 'recycle' ? (
                          <Recycle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Award className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{activity.item}</p>
                        <p className="text-gray-500 text-xs">{activity.time}</p>
                      </div>
                    </div>
                    <span className="text-green-400 font-semibold">{activity.points}</span>
                  </div>
                ))}

                <button className="w-full p-4 text-green-400 hover:bg-gray-700/30 transition-colors flex items-center justify-center gap-2">
                  View All Activity
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-lg border-t border-gray-700">
        <div className="max-w-md mx-auto flex items-center justify-around py-3">
          {[
            { id: 'home', icon: Home, label: 'Home', action: () => setActiveTab('home') },
            { id: 'scan', icon: Camera, label: 'Scan', action: () => { setActiveTab('home'); setIsWasteScannerOpen(true); } },
            { id: 'map', icon: Map, label: 'Map', action: () => { setActiveTab('home'); setIsBinLocatorOpen(true); } },
            { id: 'rewards', icon: Gift, label: 'Rewards', action: () => { setActiveTab('home'); setIsRewardsOpen(true); } },
            { id: 'profile', icon: User, label: 'Profile', action: () => setActiveTab('profile') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${activeTab === tab.id ? 'text-green-400' : 'text-gray-400 hover:text-gray-300'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
