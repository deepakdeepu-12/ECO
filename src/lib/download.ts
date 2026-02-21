// Download Service for App Distribution
// Handles APK generation and download tracking

interface DownloadStats {
  totalDownloads: number;
  androidDownloads: number;
  lastDownloadTime: string;
}

interface DownloadResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  fileName?: string;
}

// Track downloads in localStorage (simulated backend)
const getDownloadStats = (): DownloadStats => {
  const stats = localStorage.getItem('ecosync_download_stats');
  if (stats) {
    return JSON.parse(stats);
  }
  return {
    totalDownloads: 125847,
    androidDownloads: 125847,
    lastDownloadTime: new Date().toISOString()
  };
};

const updateDownloadStats = (): void => {
  const stats = getDownloadStats();
  stats.totalDownloads += 1;
  stats.androidDownloads += 1;
  stats.lastDownloadTime = new Date().toISOString();
  localStorage.setItem('ecosync_download_stats', JSON.stringify(stats));
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
    // Simulate server processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate the APK file
    const apkBlob = generateAPKContent();
    
    // Create download URL
    const downloadUrl = URL.createObjectURL(apkBlob);
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'EcoSync-v2.1.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL after download starts
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    
    // Update download statistics
    updateDownloadStats();
    
    return {
      success: true,
      message: 'Download started successfully!',
      downloadUrl,
      fileName: 'EcoSync-v2.1.0.apk'
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

export type { DownloadStats, DownloadResponse };
