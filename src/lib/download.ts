// Download Service for App Distribution
// Handles APK generation and download tracking

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
}

interface DeviceInfo {
  platform: 'android' | 'ios' | 'web';
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  userAgent: string;
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

// Main download function
export const downloadApp = async (): Promise<DownloadResponse> => {
  try {
    const deviceInfo = detectDevice();
    
    // For production apps, redirect to app stores
    // Uncomment these when you have published apps:
    /*
    if (deviceInfo.isAndroid) {
      // Redirect to Google Play Store
      window.location.href = 'https://play.google.com/store/apps/details?id=com.ecosync.wastemanagement';
      return {
        success: true,
        message: 'Redirecting to Google Play Store...',
        platform: 'android'
      };
    }
    
    if (deviceInfo.isIOS) {
      // Redirect to Apple App Store
      window.location.href = 'https://apps.apple.com/app/ecosync-waste-management/id123456789';
      return {
        success: true,
        message: 'Redirecting to Apple App Store...',
        platform: 'ios'
      };
    }
    */
    
    // Check if we have a real APK to download
    if (hasRealAPK()) {
      // Download from hosted URL
      if (deviceInfo.isAndroid || !deviceInfo.isMobile) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const link = document.createElement('a');
        link.href = APK_DOWNLOAD_URL;
        link.download = 'EcoSync-v2.1.0.apk';
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        updateDownloadStats(deviceInfo.platform);
        
        return {
          success: true,
          message: deviceInfo.isAndroid 
            ? 'Download started! Check your downloads folder.' 
            : 'Download started! Transfer to your Android device.',
          downloadUrl: APK_DOWNLOAD_URL,
          fileName: 'EcoSync-v2.1.0.apk',
          platform: deviceInfo.platform
        };
      }
    }
    
    // No real APK available - this is a web app demo
    if (deviceInfo.isAndroid) {
      return {
        success: false,
        message: 'Demo Mode: This is currently a web application.\n\n' +
                 '✨ Good news! You can use all features right now in your mobile browser!\n\n' +
                 '📱 To use the full app:\n' +
                 '• Continue using this website on your phone\n' +
                 '• All features work in your browser\n' +
                 '• Save this page to your home screen for easy access\n\n' +
                 '🔔 Native Android app coming soon!',
        platform: 'android'
      };
    }
    
    // iOS users
    if (deviceInfo.isIOS) {
      return {
        success: false,
        message: 'Demo Mode: This is currently a web application.\n\n' +
                 '✨ You can use all features right now in Safari!\n\n' +
                 '📱 To add to home screen:\n' +
                 '1. Tap the Share button (box with arrow)\n' +
                 '2. Scroll and tap "Add to Home Screen"\n' +
                 '3. Enjoy app-like experience!\n\n' +
                 '🔔 iOS app coming soon!',
        platform: 'ios'
      };
    }
    
    // Desktop users
    return {
      success: false,
      message: 'This is a web application demo.\n\n' +
               'The mobile app is currently in development.\n\n' +
               'You can explore all features through this website,\n' +
               'or access it from your mobile device for the best experience.',
      platform: 'web'
    };
    
  } catch (error) {
    console.error('Download error:', error);
    return {
      success: false,
      message: 'An error occurred. Please try again or use the web version.'
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
