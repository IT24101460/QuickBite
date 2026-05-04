import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from '../utils/auth';

/** Preferred backend order: Render -> Railway -> Local */
export const RENDER_API_URL = 'https://quickbite-2069.onrender.com';
export const RAILWAY_API_URL = 'https://quickbite-production-cc3e.up.railway.app';

/** Local dev server: Android emulator → host machine; iOS simulator → localhost */
export const LOCAL_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const HEALTH_PATH = '/health';
const FEEDBACK_USER_PROBE_PATH = '/feedback/user/my-feedback';
const HEALTH_TIMEOUT_MS = 5000;

let activeBaseUrl = RENDER_API_URL;
let initPromise = null;

/**
 * After init, use this for image URLs and any code that needs the same host as API.
 * Before init completes, returns deployed URL (optimistic).
 */
export function getBaseUrl() {
  return activeBaseUrl;
}

/**
 * Probe deployed health; on failure use localhost. Safe to call multiple times.
 */
export async function initApiBaseUrl() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const backendCandidates = [RENDER_API_URL, RAILWAY_API_URL, LOCAL_API_URL];

    for (const baseUrl of backendCandidates) {
      try {
        // 1) Backend health check
        await axios.get(`${baseUrl}${HEALTH_PATH}`, {
          timeout: HEALTH_TIMEOUT_MS,
          validateStatus: (s) => s === 200,
        });

        // 2) Confirm feedback user route exists.
        // Without auth, expected status is usually 401/403.
        const probe = await axios.get(`${baseUrl}${FEEDBACK_USER_PROBE_PATH}`, {
          timeout: HEALTH_TIMEOUT_MS,
          validateStatus: () => true,
        });

        if ([200, 401, 403].includes(probe.status)) {
          activeBaseUrl = baseUrl;
          API.defaults.baseURL = activeBaseUrl;
          return activeBaseUrl;
        }
      } catch {
        // Try next candidate
      }
    }

    // Last resort fallback
    activeBaseUrl = LOCAL_API_URL;
    API.defaults.baseURL = activeBaseUrl;
    return activeBaseUrl;
  })();

  return initPromise;
}

const API = axios.create({
  baseURL: RENDER_API_URL,
});

API.interceptors.request.use(async (config) => {
  await initApiBaseUrl();
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
