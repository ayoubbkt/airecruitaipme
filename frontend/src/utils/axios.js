import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  // withCredentials: true
});

// Request interceptor for adding the auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle different error statuses
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - Redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          toast.error('Vous n\'avez pas les permissions nécessaires');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          toast.error('Erreur serveur. Veuillez réessayer plus tard.');
          break;
        default:
          // Other errors
          const errorMessage = response.data?.message || 'Une erreur est survenue';
          toast.error(errorMessage);
      }
    } else {
      // Network error
      toast.error('Erreur réseau. Veuillez vérifier votre connexion.');
    }
    
    return Promise.reject(error);
  }
);

export default instance;