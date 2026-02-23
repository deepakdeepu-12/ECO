@echo off
REM EcoSync - Quick APK Build Script for Windows
REM ==============================================

echo.
echo ╔═══════════════════════════════════════════╗
echo ║   EcoSync APK Builder                    ║
echo ║   Smart Waste Management App             ║
echo ╚═══════════════════════════════════════════╝
echo.

:MENU
echo What would you like to do?
echo.
echo [1] Build Web App (Required first step)
echo [2] Setup Android Platform (First time only)
echo [3] Sync Changes to Android
echo [4] Open in Android Studio
echo [5] Build Debug APK (CLI)
echo [6] Build Release APK (CLI)
echo [7] View APK Download Configuration
echo [8] Exit
echo.

set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto BUILD_WEB
if "%choice%"=="2" goto SETUP_ANDROID
if "%choice%"=="3" goto SYNC
if "%choice%"=="4" goto OPEN_STUDIO
if "%choice%"=="5" goto BUILD_DEBUG
if "%choice%"=="6" goto BUILD_RELEASE
if "%choice%"=="7" goto VIEW_CONFIG
if "%choice%"=="8" goto EXIT
goto INVALID

:BUILD_WEB
echo.
echo ═══════════════════════════════════════════
echo Building Web App...
echo ═══════════════════════════════════════════
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ Build failed! Check errors above.
) else (
    echo.
    echo ✅ Web app built successfully!
    echo 📂 Output: dist/
)
echo.
pause
goto MENU

:SETUP_ANDROID
echo.
echo ═══════════════════════════════════════════
echo Setting up Android Platform...
echo ═══════════════════════════════════════════
echo.
echo This will:
echo - Add Android platform to your project
echo - Create android/ directory
echo - Sync web assets
echo.
call npx cap add android
if errorlevel 1 (
    echo.
    echo ⚠️  Android platform may already exist.
) else (
    echo.
    echo ✅ Android platform added!
)
echo.
call npx cap sync
echo.
echo ✅ Setup complete!
echo.
pause
goto MENU

:SYNC
echo.
echo ═══════════════════════════════════════════
echo Syncing Changes to Android...
echo ═══════════════════════════════════════════
call npx cap sync
echo.
echo ✅ Sync complete!
echo.
pause
goto MENU

:OPEN_STUDIO
echo.
echo ═══════════════════════════════════════════
echo Opening Android Studio...
echo ═══════════════════════════════════════════
echo.
echo Make sure Android Studio is installed!
echo.
call npx cap open android
echo.
pause
goto MENU

:BUILD_DEBUG
echo.
echo ═══════════════════════════════════════════
echo Building Debug APK (via Gradle)...
echo ═══════════════════════════════════════════
echo.
if not exist "android" (
    echo ❌ Android platform not found!
    echo    Run option [2] first to setup Android.
    echo.
    pause
    goto MENU
)
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo ❌ Build failed! Check errors above.
) else (
    echo.
    echo ✅ Debug APK built successfully!
    echo 📂 Location: android\app\build\outputs\apk\debug\app-debug.apk
)
cd ..
echo.
pause
goto MENU

:BUILD_RELEASE
echo.
echo ═══════════════════════════════════════════
echo Building Release APK (via Gradle)...
echo ═══════════════════════════════════════════
echo.
echo ⚠️  NOTE: You need a signing key configured!
echo    See APK_BUILD_GUIDE.md for details.
echo.
if not exist "android" (
    echo ❌ Android platform not found!
    echo    Run option [2] first to setup Android.
    echo.
    pause
    goto MENU
)
cd android
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo.
    echo ❌ Build failed! 
    echo.
    echo Common issues:
    echo - No signing key configured
    echo - Check APK_BUILD_GUIDE.md for signing setup
) else (
    echo.
    echo ✅ Release APK built successfully!
    echo 📂 Location: android\app\build\outputs\apk\release\app-release.apk
)
cd ..
echo.
pause
goto MENU

:VIEW_CONFIG
echo.
echo ═══════════════════════════════════════════
echo APK Download Configuration
echo ═══════════════════════════════════════════
echo.
echo 📄 File: src\lib\download.ts
echo.
echo To enable APK downloads:
echo.
echo 1. Build your APK (use options 5 or 6)
echo 2. Host it online (see APK_BUILD_GUIDE.md)
echo 3. Update APK_DOWNLOAD_URL in src\lib\download.ts
echo 4. Rebuild web app (option 1)
echo.
echo Current hosting options:
echo   • GitHub Releases (recommended)
echo   • AWS S3 / CloudFlare R2
echo   • Your own web server
echo   • Google Drive / Dropbox
echo.
echo 📖 Full guide: APK_BUILD_GUIDE.md
echo.
pause
goto MENU

:INVALID
echo.
echo ❌ Invalid choice. Please enter 1-8.
echo.
pause
goto MENU

:EXIT
echo.
echo Thanks for using EcoSync APK Builder!
echo.
exit /b 0
