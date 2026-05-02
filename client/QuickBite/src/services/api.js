import axios from 'axios';
import { getToken } from '../utils/auth';

export const BASE_URL = 'https://quickbite-production-cc3e.up.railway.app';

const API = axios.create({
  baseURL: BASE_URL,
});

// Attach auth token to every request
API.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
