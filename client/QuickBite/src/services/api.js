import axios from 'axios';
import { getToken } from '../utils/auth';

const API = axios.create({
  baseURL: 'http://10.0.2.2:3000',
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