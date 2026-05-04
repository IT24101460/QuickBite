import { getBaseUrl } from '../services/api';

export const getImageUrl = (path) => {
  if (!path) return null;
  const base = getBaseUrl();

  if (typeof path === 'string' && path.includes('10.0.2.2:3000')) {
    return path.replace('http://10.0.2.2:3000', base);
  }

  if (path.startsWith('http')) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};
