# 📱 EcoSync - App Download Quick Reference

---

## 🎯 Goal
Enable users to **download and install** the EcoSync app on Android without:
- Using just the web version
- Cloning the GitHub repository
- Knowing anything about development

---

## ⚡ 3-Step Setup

### 1️⃣ Build APK
```bash
./build-apk.bat
```
Choose:
- `[1]` Build Web App
- `[2]` Setup Android Platform  
- `[4]` Open in Android Studio
- In Android Studio: `Build → Build APK`

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

---

### 2️⃣ Host Online (GitHub Releases - Recommended)

1. Go to your repo → **Releases** → **Create new release**
2. Tag: `v2.1.0`
3. Upload APK (rename to `EcoSync-v2.1.0.apk`)
4. **Publish release**
5. Copy download URL:
   ```
   https://github.com/USERNAME/REPO/releases/download/v2.1.0/EcoSync-v2.1.0.apk
   ```

**Alternatives:**
- Google Drive: `https://drive.google.com/uc?export=download&id=FILE_ID`
- Dropbox: Change `dl=0` to `dl=1` in sharing link
- AWS S3, CloudFlare R2, your own server

---

### 3️⃣ Configure URL

Edit `src/lib/download.ts` (line ~88):

```typescript
const APK_DOWNLOAD_URL = 'https://github.com/yourusername/smart-waste-management-app/releases/download/v2.1.0/EcoSync-v2.1.0.apk';
```

Rebuild and redeploy:
```bash
npm run build
# Deploy to Render/Vercel/Netlify
```

---

## ✅ Test

1. Visit app on Android device
2. Click **"Install App"** button
3. APK downloads automatically
4. Install and enjoy! 🎉

---

## 📋 Files Reference

| File | Purpose |
|------|---------|
| `src/lib/download.ts` | Configure APK_DOWNLOAD_URL here |
| `build-apk.bat` | Automated APK builder (Windows) |
| `ENABLE_APP_DOWNLOADS.md` | Quick start guide |
| `APK_BUILD_GUIDE.md` | Complete detailed guide |
| `capacitor.config.ts` | Mobile app settings |

---

## 🔧 Key Commands

```bash
# Build web app
npm run build

# Setup Android (first time)
npx cap add android

# Sync changes
npx cap sync

# Open in Android Studio
npx cap open android

# Build debug APK (CLI)
cd android && gradlew assembleDebug

# Build release APK (CLI)  
cd android && gradlew assembleRelease
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| APK won't install | Enable "Install from unknown sources" on device |
| Download button doesn't work | Check APK_DOWNLOAD_URL is set and accessible |
| Build fails in Android Studio | Run `cd android && ./gradlew clean` |
| No Android Studio? | Install from [developer.android.com/studio](https://developer.android.com/studio) |

---

## 🌟 What's Already Built

Your app already has:

✅ **Device detection** - Auto-detects Android/iOS/Desktop  
✅ **Smart download button** - Shows appropriate option per device  
✅ **PWA fallback** - Works as Progressive Web App if no APK  
✅ **Download counter** - Tracks installation statistics  
✅ **Install instructions** - Platform-specific guidance  

You just need to configure the APK URL!

---

## 📖 Full Documentation

For production apps, signed releases, Play Store publishing, and more:

👉 **[APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md)**

---

## 🎉 Done!

Once configured, users can install EcoSync with one click - no technical knowledge needed!
