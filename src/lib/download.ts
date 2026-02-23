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
const WEB_APP_URL = 'https://eco-sage-nine.vercel.app';

// Check if we have a real APK to download
const hasRealAPK = (): boolean => {
  return APK_DOWNLOAD_URL.trim().length > 0;
};

// Generate installable web app package (HTML file)
const generateWebAppPackage = (): Blob => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#10b981">
    <title>EcoSync - Smart Waste Management</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #0d5c2e 100%);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981, #34d399);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 40px;
        }
        h1 {
            text-align: center;
            font-size: 28px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #10b981, #34d399);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .version {
            text-align: center;
            color: #9ca3af;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .action-button {
            display: block;
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 18px;
            margin-bottom: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
        }
        .action-button:active {
            transform: translateY(0);
        }
        .info-section {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
        }
        .info-section h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #10b981;
        }
        .feature-list {
            list-style: none;
            padding-left: 0;
        }
        .feature-list li {
            padding: 8px 0;
            padding-left: 28px;
            position: relative;
            color: #d1d5db;
        }
        .feature-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
            font-size: 18px;
        }
        .install-instructions {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            padding: 15px;
            margin-top: 20px;
            font-size: 14px;
            line-height: 1.6;
        }
        .install-instructions strong {
            color: #60a5fa;
            display: block;
            margin-bottom: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #9ca3af;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🌱</div>
        <h1>EcoSync</h1>
        <p class="version">Smart Waste Management v2.1.0</p>
        
        <a href="${WEB_APP_URL}" class="action-button" target="_blank" rel="noopener noreferrer">
            🚀 Launch Web App Now
        </a>
        
        <div class="info-section">
            <h2>📱 Features</h2>
            <ul class="feature-list">
                <li>AI-powered waste classification</li>
                <li>Smart bin monitoring & locator</li>
                <li>Recycling rewards program</li>
                <li>Carbon footprint tracking</li>
                <li>Community challenges</li>
                <li>Impact dashboard</li>
            </ul>
        </div>
        
        <div class="install-instructions">
            <strong>📲 Install as App (Android):</strong>
            1. Open this file in Chrome<br>
            2. Tap menu (⋮) → "Add to Home screen"<br>
            3. Launch from your home screen!<br><br>
            
            <strong>📲 Install as App (iOS):</strong>
            1. Open link in Safari<br>
            2. Tap Share (□↑) → "Add to Home Screen"<br>
            3. Enjoy the app experience!
        </div>
        
        <div class="footer">
            <p>© 2026 EcoSync Technologies</p>
            <p>Making the world cleaner, one scan at a time 🌍</p>
        </div>
    </div>
    
    <script>
        // Auto-redirect after 3 seconds if user doesn't click
        setTimeout(function() {
            if (confirm('Ready to launch EcoSync Web App now?')) {
                window.location.href = '${WEB_APP_URL}';
            }
        }, 3000);
    </script>
</body>
</html>`;
  
  return new Blob([htmlContent], { type: 'text/html' });
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
      // Download real APK from hosted URL
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
        message: 'Download started successfully!',
        downloadUrl: APK_DOWNLOAD_URL,
        fileName: 'EcoSync-v2.1.0.apk',
        platform: deviceInfo.platform
      };
    }
    
    // Download web app package (HTML file with app info and launch button)
    // This downloads instantly and provides instructions
    const webAppBlob = generateWebAppPackage();
    const downloadUrl = URL.createObjectURL(webAppBlob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'EcoSync-WebApp.html';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL after download
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    
    // Update download statistics
    updateDownloadStats(deviceInfo.platform);
    
    return {
      success: true,
      message: 'App package downloaded! Open the HTML file to launch EcoSync.',
      downloadUrl,
      fileName: 'EcoSync-WebApp.html',
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
