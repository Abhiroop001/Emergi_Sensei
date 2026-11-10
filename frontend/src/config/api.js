/**
 * Global API Configuration for Emergi-Sensei
 * Automatically routes to the live Render cloud backend in production environments,
 * or localhost:8001 when running locally.
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  
  // If running in browser and not on localhost, use the live Render backend
  if (typeof window !== 'undefined' && window.location.hostname) {
    const isLocal = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0';
    if (!isLocal) {
      return 'https://emergi-sensei-backend.onrender.com';
    }
  }
  
  return 'http://localhost:8001';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;

