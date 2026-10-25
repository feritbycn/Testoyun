# Android APK

The repo includes a Capacitor Android project (`android/`) and a GitHub Actions workflow
(`.github/workflows/android-apk.yml`) that builds a **debug APK** on every push.

## Get the APK
GitHub -> Actions -> "Build Android APK" -> latest run -> Artifacts -> `RoadMaster-Bus-Empire-debug-apk`.
(You can also start it manually with "Run workflow".) Unzip and install `app-debug.apk` on your phone
(allow "install unknown apps").

## Build locally
Requires Node 22, JDK 21 and the Android SDK.

    npm ci
    npm run build:apk
    cd android && ./gradlew assembleDebug

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

This is a debug-signed APK for testing. Google Play release needs a release keystore, and billing/ads
must use official Android SDKs (see IN_APP_PURCHASES.md and ADS_INTEGRATION.md).
