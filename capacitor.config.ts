import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.egytradehub.app',
  appName: 'EgyTradeHub',
  webDir: 'dist',
  server: {
    url: 'https://egytradehub.vercel.app',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FF6A00',
    },
  },
};

export default config;
