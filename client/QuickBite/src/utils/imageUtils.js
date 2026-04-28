import { BASE_URL } from '../services/api';

export const getImageUrl = (path) => {
  if (!path) return null;

  // If it's a legacy local URL from the emulator, swap it for the production URL
  if (typeof path === 'string' && path.includes('10.0.2.2:3000')) {
    return path.replace('http://10.0.2.2:3000', BASE_URL);
  }

  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
