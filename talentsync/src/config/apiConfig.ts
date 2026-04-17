/**
 * Smart API URL resolver for Expo
 *
 * Uses the SAME IP address that Expo Go is already using to download
 * the JavaScript bundle. If your phone can load the app, it can reach
 * this IP — guaranteed.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const PORT = 8001;

function getBaseUrl(): string {
  // 1. If explicitly set via env var, always use that
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser — server is on the same machine
  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}/api`;
  }

  // 3. Mobile (Android/iOS) — extract host IP from Expo's own connection
  //    This is the IP your phone is ALREADY using to talk to Metro,
  //    so it's guaranteed to be reachable.
  const debuggerHost =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0]; // strip the Metro port
    console.log(`[apiConfig] Using Expo host IP: ${host}`);
    return `http://${host}:${PORT}/api`;
  }

  // 4. Fallback — hardcoded LAN IP
  console.warn('[apiConfig] Could not detect host IP, using fallback');
  return `http://10.198.45.121:${PORT}/api`;
}

export const BASE_URL = getBaseUrl();
console.log(`[apiConfig] BASE_URL = ${BASE_URL}`);

export default BASE_URL;
