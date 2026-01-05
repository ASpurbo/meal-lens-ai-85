import type { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT:
// - For a production Android APK that must work offline, do NOT set `server.url`.
// - Only set `CAPACITOR_SERVER_URL` when you explicitly want live-reload from a remote URL.
const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.apu25.nutrimind',
  appName: 'NutriMind',
  webDir: 'dist',
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: true,
        },
      }
    : {}),
};

export default config;

