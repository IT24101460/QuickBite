import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from '../utils/auth';

/** Production API (Railway) — tried first */
export const DEPLOYED_API_URL = 'https://quickbite-production-cc3e.up.railway.app';

/** Local dev server: Android emulator → host machine; iOS simulator → localhost */
export const LOCAL_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const HEALTH_PATH = '/health';
const FEEDBACK_USER_PROBE_PATH = '/feedback/user/my-feedback';
const HEALTH_TIMEOUT_MS = 5000;

let activeBaseUrl = DEPLOYED_API_URL;
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
    try {
      // 1) Server is up
      await axios.get(`${DEPLOYED_API_URL}${HEALTH_PATH}`, {
        timeout: HEALTH_TIMEOUT_MS,
        validateStatus: (s) => s === 200,
      });

      // 2) Ensure deployed has the required feedback user route.
      //    Without auth this should return 401 if the route exists; 404 means old backend.
      const probe = await axios.get(`${DEPLOYED_API_URL}${FEEDBACK_USER_PROBE_PATH}`, {
        timeout: HEALTH_TIMEOUT_MS,
        validateStatus: () => true,
      });

      if (probe.status === 401 || probe.status === 403) {
        activeBaseUrl = DEPLOYED_API_URL;
      } else {
        // Most importantly: 404 => route not deployed yet
        activeBaseUrl = LOCAL_API_URL;
      }
    } catch {
      activeBaseUrl = LOCAL_API_URL;
    }
    API.defaults.baseURL = activeBaseUrl;
    return activeBaseUrl;
  })();

  return initPromise;
}

const API = axios.create({
  baseURL: DEPLOYED_API_URL,
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
