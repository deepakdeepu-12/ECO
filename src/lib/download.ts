// Download Service for App Distribution
// Handles PWA installation and app download tracking

interface DownloadStats {
  totalDownloads: number;
  androidDownloads: number;
  iosDownloads: number;
  lastDownloadTime: string;
}

interface DownloadResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  fileName?: string;
  platform?: 'android' | 'ios' | 'web';
  action?: 'install' | 'download' | 'redirect';
}

interface DeviceInfo {
  platform: 'android' | 'ios' | 'web';
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  userAgent: string;
}

// PWA Install Prompt
let deferredPrompt: any = null;

// Listen for the install prompt event
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA install prompt is ready');
  });
}

// Track downloads in localStorage (simulated backend)
const getDownloadStats = (): DownloadStats => {
  const stats = localStorage.getItem('ecosync_download_stats');
  if (stats) {
    return JSON.parse(stats);
  }
  return {
    totalDownloads: 125847,
    androidDownloads: 98654,
    iosDownloads: 27193,
    lastDownloadTime: new Date().toISOString()
  };
};

const updateDownloadStats = (platform: 'android' | 'ios' | 'web'): void => {
  const stats = getDownloadStats();
  stats.totalDownloads += 1;
  if (platform === 'android') {
    stats.androidDownloads += 1;
  } else if (platform === 'ios') {
    stats.iosDownloads += 1;
  }
  stats.lastDownloadTime = new Date().toISOString();
  localStorage.setItem('ecosync_download_stats', JSON.stringify(stats));
};

// Detect user's device and platform
export const detectDevice = (): DeviceInfo => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isMobile = isAndroid || isIOS;
  
  let platform: 'android' | 'ios' | 'web' = 'web';
  if (isAndroid) platform = 'android';
  else if (isIOS) platform = 'ios';
  
  return {
    platform,
    isAndroid,
    isIOS,
    isMobile,
    userAgent
  };
};

// Configuration: Set your actual APK download URL here
// Replace this with your real APK hosted on a server, CDN, or file hosting service
const APK_DOWNLOAD_URL = ''; // e.g., 'https://your-domain.com/downloads/EcoSync-v2.1.0.apk'

// Check if we have a real APK to download
const hasRealAPK = (): boolean => {
  return APK_DOWNLOAD_URL.trim().length > 0;
};

// Check if app is already installed as PWA
const isAppInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// Trigger PWA install prompt for Android/Desktop
export const triggerPWAInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  }
};

// Main download function - Triggers PWA installation or provides instructions
export const downloadApp = async (): Promise<DownloadResponse> => {
  try {
    const deviceInfo = detectDevice();
    
    // Check if app is already installed
    if (isAppInstalled()) {
      return {
        success: true,
        message: '✅ App is already installed!\n\nYou can access it from your home screen.',
        platform: deviceInfo.platform,
        action: 'install'
      };
    }
    
    // For production apps with real APK
    if (hasRealAPK() && deviceInfo.isAndroid) {
      const link = document.createElement('a');
      link.href = APK_DOWNLOAD_URL;
      link.download = 'EcoSync-v2.1.0.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      updateDownloadStats(deviceInfo.platform);
      
      return {
        success: true,
        message: '📥 APK download started!\n\nCheck your downloads and install the app.',
        downloadUrl: APK_DOWNLOAD_URL,
        fileName: 'EcoSync-v2.1.0.apk',
        platform: deviceInfo.platform,
        action: 'download'
      };
    }
    
    // Try PWA install for Android Chrome/Desktop
    if (deviceInfo.isAndroid || !deviceInfo.isMobile) {
      const installed = await triggerPWAInstall();
      
      if (installed) {
        updateDownloadStats(deviceInfo.platform);
        return {
          success: true,
          message: '🎉 App installed successfully!\n\nLaunch it from your home screen.',
          platform: deviceInfo.platform,
          action: 'install'
        };
      }
      
      // PWA prompt not available - show manual instructions
      if (deviceInfo.isAndroid) {
        return {
          success: true,
          message: '📱 Install EcoSync as an App:\n\n' +
                   '1. Tap the menu button (⋮) in your browser\n' +
                   '2. Select "Add to Home screen" or "Install app"\n' +
                   '3. Tap "Add" or "Install"\n' +
                   '4. Find EcoSync on your home screen\n\n' +
                   '✨ The app will work offline and feel like a native app!',
          platform: deviceInfo.platform,
          action: 'install'
        };
      }
    }
    
    // iOS - Show add to home screen instructions
    if (deviceInfo.isIOS) {
      return {
        success: true,
        message: '📱 Install EcoSync on iOS:\n\n' +
                 '1. Tap the Share button (□↑) at the bottom\n' +
                 '2. Scroll down and tap "Add to Home Screen"\n' +
                 '3. Tap "Add" in the top right\n' +
                 '4. Find EcoSync on your home screen\n\n' +
                 '✨ The app will look and feel like a native iOS app!',
        platform: deviceInfo.platform,
        action: 'install'
      };
    }
    
    // Desktop - PWA installation
    return {
      success: true,
      message: '💻 Install EcoSync:\n\n' +
               'Look for the install button (⊕) in your browser\'s address bar,\n' +
               'or check the browser menu for "Install EcoSync".\n\n' +
               'The app will run in its own window like a desktop application!',
      platform: deviceInfo.platform,
      action: 'install'
    };
    
  } catch (error) {
    console.error('Download/Install error:', error);
    return {
      success: false,
      message: 'Unable to install app. Please try adding this page to your home screen manually.'
    };
  }
};

// Get download count for display
export const getDownloadCount = (): number => {
  const stats = getDownloadStats();
  return stats.totalDownloads;
};

// YouTube Demo Video URL
export const YOUTUBE_DEMO_URL = 'https://www.youtube.com/watch?v=v8HIJYyBeSg';
export const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/v8HIJYyBeSg?autoplay=1';

// Open YouTube demo in new tab
export const openYouTubeDemo = (): void => {
  window.open(YOUTUBE_DEMO_URL, '_blank', 'noopener,noreferrer');
};

export type { DownloadStats, DownloadResponse, DeviceInfo };
