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

// Generate APK file content (simulated)
const generateAPKContent = (): Blob => {
  // Create a proper APK-like structure
  // In production, this would be a real APK file from your server
  
  const apkHeader = new Uint8Array([
    0x50, 0x4B, 0x03, 0x04, // PK ZIP header (APK is a ZIP file)
    0x14, 0x00, 0x00, 0x00,
    0x08, 0x00, 0x00, 0x00,
  ]);
  
  // Create manifest content
  const manifestContent = `
EcoSync - Smart Waste Management App
=====================================
Version: 2.1.0
Package: com.ecosync.wastemanagement
Min SDK: 21 (Android 5.0)
Target SDK: 34 (Android 14)

Features:
- AI-powered waste classification
- Smart bin monitoring
- Route optimization
- Recycling rewards
- Carbon footprint tracking
- Community challenges

© 2024 EcoSync Technologies
  `.trim();
  
  // Create app info
  const appInfo = {
    name: "EcoSync",
    version: "2.1.0",
    versionCode: 21,
    packageName: "com.ecosync.wastemanagement",
    minSdkVersion: 21,
    targetSdkVersion: 34,
    permissions: [
      "android.permission.CAMERA",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.INTERNET",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ],
    features: [
      "AI Waste Classification",
      "Smart Bin Monitoring",
      "Route Optimization",
      "Recycling Rewards",
      "Carbon Tracking",
      "Community Features"
    ],
    buildDate: new Date().toISOString(),
    developer: "EcoSync Technologies",
    website: "https://ecosync.app"
  };
  
  // Combine all content
  const fullContent = new TextEncoder().encode(
    JSON.stringify(appInfo, null, 2) + '\n\n' + manifestContent
  );
  
  // Create the final blob
  const combinedArray = new Uint8Array(apkHeader.length + fullContent.length);
  combinedArray.set(apkHeader, 0);
  combinedArray.set(fullContent, apkHeader.length);
  
  return new Blob([combinedArray], { type: 'application/vnd.android.package-archive' });
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
    
    // For development/testing: Direct APK download
    // This simulates downloading the actual app for Android
    if (deviceInfo.isAndroid || !deviceInfo.isMobile) {
      // Simulate server processing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate the APK file
      const apkBlob = generateAPKContent();
      
      // Create download URL
      const downloadUrl = URL.createObjectURL(apkBlob);
      
      // For mobile devices, use a more reliable download method
      if (deviceInfo.isMobile) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'EcoSync-v2.1.0.apk';
        link.setAttribute('target', '_blank');
        
        // For Android, we need to handle the download more carefully
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        }, 1000);
        
      } else {
        // Desktop download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'EcoSync-v2.1.0.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL after download starts
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }
      
      // Update download statistics
      updateDownloadStats(deviceInfo.platform);
      
      return {
        success: true,
        message: deviceInfo.isAndroid 
          ? 'APK download started! Please check your downloads folder and install the app.' 
          : 'APK download started! Transfer to your Android device to install.',
        downloadUrl,
        fileName: 'EcoSync-v2.1.0.apk',
        platform: deviceInfo.platform
      };
    }
    
    // iOS users without App Store link
    if (deviceInfo.isIOS) {
      return {
        success: false,
        message: 'iOS version coming soon! Please check back later or use the web version.',
        platform: 'ios'
      };
    }
    
    return {
      success: false,
      message: 'Unsupported platform',
      platform: deviceInfo.platform
    };
    
  } catch (error) {
    console.error('Download error:', error);
    return {
      success: false,
      message: 'Download failed. Please try again.'
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
