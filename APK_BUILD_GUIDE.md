# 📱 EcoSync APK Build & Distribution Guide

This guide explains how to build, sign, and distribute the EcoSync Android APK to users.

---

## 🛠️ Prerequisites

Before building the APK, ensure you have:

- ✅ Node.js (v16+) and npm installed
- ✅ Android Studio installed ([download here](https://developer.android.com/studio))
- ✅ Java Development Kit (JDK 11 or higher)
- ✅ Basic knowledge of Android development

---

## 📦 Step 1: Build the Web App

First, create an optimized production build of the web app:

```bash
npm install
npm run build
```

This creates a `dist/` folder with the compiled web assets.

---

## 🔧 Step 2: Set Up Capacitor for Android

If you haven't already added the Android platform:

```bash
# Install Capacitor CLI globally (if needed)
npm install -g @capacitor/cli

# Add Android platform
npx cap add android

# Sync web assets to Android project
npx cap sync
```

---

## 📱 Step 3: Build the APK

### Option A: Using Android Studio (Recommended)

1. **Open the Android project:**
   ```bash
   npx cap open android
   ```

2. **Wait for Gradle sync** to complete in Android Studio

3. **Build the APK:**
   - Go to: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Or use the shortcut: `Ctrl+Shift+A` (Windows) / `Cmd+Shift+A` (Mac) and search for "Build APK"

4. **Locate the APK:**
   - After building, click "locate" in the notification
   - Default path: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B: Using Command Line

```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔐 Step 4: Create a Release APK (Production)

### Generate a Signing Key

```bash
keytool -genkey -v -keystore ecosync-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias ecosync-key
```

**Important:** Keep this keystore file safe! You'll need it for all future updates.

### Configure Signing in Android Studio

1. In Android Studio, go to: `Build` → `Generate Signed Bundle / APK`
2. Select "APK" and click "Next"
3. Create new keystore or select existing one
4. Fill in the credentials
5. Select "release" build variant
6. Click "Finish"

The signed APK will be at: `android/app/release/app-release.apk`

### Or Sign via Command Line

Create `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=ecosync-key
storeFile=../ecosync-release-key.jks
```

Update `android/app/build.gradle` to use the signing config, then:

```bash
cd android
./gradlew assembleRelease
```

---

## 🌐 Step 5: Host Your APK

Choose one of these options:

### Option 1: GitHub Releases (Recommended - Free)

1. **Create a new release** on your GitHub repository:
   - Go to your repo → "Releases" → "Create a new release"
   - Tag: `v2.1.0` (or your version)
   - Title: `EcoSync v2.1.0`
   - Description: Add changelog

2. **Upload the APK:**
   - Drag and drop `app-release.apk` (rename to `EcoSync-v2.1.0.apk`)
   - Click "Publish release"

3. **Get the download URL:**
   ```
   https://github.com/USERNAME/REPO/releases/download/v2.1.0/EcoSync-v2.1.0.apk
   ```

### Option 2: Cloud Storage (AWS S3, CloudFlare R2, Google Cloud)

1. Upload APK to your bucket
2. Make it publicly accessible
3. Get the public URL

**AWS S3 Example:**
```
https://your-bucket.s3.amazonaws.com/downloads/EcoSync-v2.1.0.apk
```

### Option 3: Your Own Web Server

1. Upload APK to your server's public directory
2. Ensure proper MIME type: `application/vnd.android.package-archive`
3. URL example:
   ```
   https://yourdomain.com/downloads/EcoSync-v2.1.0.apk
   ```

### Option 4: File Hosting Services

**Google Drive:**
1. Upload APK to Google Drive
2. Right-click → "Get link" → Set permissions to "Anyone with the link"
3. Convert the sharing link to direct download:
   ```
   Original: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   Direct:   https://drive.google.com/uc?export=download&id=FILE_ID
   ```

**Dropbox:**
1. Upload and share the APK
2. Change `dl=0` to `dl=1` in the sharing URL:
   ```
   Original: https://www.dropbox.com/s/abc123/EcoSync.apk?dl=0
   Direct:   https://www.dropbox.com/s/abc123/EcoSync.apk?dl=1
   ```

---

## ⚙️ Step 6: Configure the App Download URL

Edit `src/lib/download.ts` and update the APK URL:

```typescript
const APK_DOWNLOAD_URL = 'https://github.com/yourusername/smart-waste-management-app/releases/download/v2.1.0/EcoSync-v2.1.0.apk';
```

**Test the URL** by opening it in a browser - it should download the APK directly.

---

## 🧪 Step 7: Test the Download

1. **Rebuild the web app** with the updated URL:
   ```bash
   npm run build
   ```

2. **Deploy to your hosting** (Render, Vercel, Netlify, etc.)

3. **Test on Android device:**
   - Visit your deployed site on Android
   - Click "Install App" button
   - APK should download automatically
   - Install and verify

---

## 📲 Alternative: Distribute via Play Store

For production apps, consider publishing to Google Play Store:

1. **Prepare store listing** (screenshots, description, icon)
2. **Create a Google Play Developer account** ($25 one-time fee)
3. **Upload release APK/Bundle** to Play Console
4. **Submit for review** (takes 1-3 days)

**Benefits:**
- ✅ Automatic updates
- ✅ Better security & trust
- ✅ Statistics and crash reports
- ✅ In-app purchases support

---

## 🔄 Updating Your App

When releasing a new version:

1. Update version in `capacitor.config.ts`:
   ```typescript
   const config: CapacitorConfig = {
     appId: 'com.ecosync.wastemanagement',
     appName: 'EcoSync',
     webDir: 'dist',
     android: {
       versionCode: 2,  // Increment this
       versionName: '2.1.1'
     }
   };
   ```

2. Rebuild, sign, and upload new APK
3. Update `APK_DOWNLOAD_URL` in `src/lib/download.ts`
4. Redeploy your web app

---

## 🐛 Troubleshooting

### APK won't install on device

**Issue:** "App not installed" error  
**Solution:**
- Ensure "Install from unknown sources" is enabled
- Uninstall old version first if exists
- Check if APK is properly signed

### Download button does nothing

**Issue:** Click doesn't trigger download  
**Solution:**
- Check browser console for errors
- Verify `APK_DOWNLOAD_URL` is set and accessible
- Test URL directly in browser
- Check CORS headers if hosting on different domain

### Android Studio build fails

**Issue:** Gradle build errors  
**Solution:**
```bash
cd android
./gradlew clean
./gradlew build --refresh-dependencies
```

---

## 📋 Quick Reference Commands

```bash
# Build web app
npm run build

# Add Android platform
npx cap add android

# Sync changes
npx cap sync

# Open in Android Studio
npx cap open android

# Build debug APK via CLI
cd android && ./gradlew assembleDebug

# Build release APK via CLI
cd android && ./gradlew assembleRelease

# Clean build
cd android && ./gradlew clean
```

---

## 🎉 You're Done!

Your users can now download and install the EcoSync app directly on their Android devices without needing to clone the repository or use the web version!

**Next Steps:**
- 📊 Monitor download statistics
- 🐛 Collect user feedback and crash reports
- 🔄 Release updates regularly
- 🌟 Consider Play Store publication

---

**Need help?** Check the official documentation:
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Android Developer Docs](https://developer.android.com)
