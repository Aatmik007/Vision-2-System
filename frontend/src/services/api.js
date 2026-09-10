import axios from 'axios';

const API = axios.create({
  // Ensure HTTPS is explicitly declared to avoid 308 redirects
  baseURL: import.meta.env.VITE_API_URL || 'https://vision-2-system.onrender.com/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;