// recruitpme/frontend/src/utils/axios.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { mockData } from '../mock/mockData';


// Créer l'instance axios pour le développement réel avec backend
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Des fonctions de mock pour simuler les appels API
const mockAPI = {
  get: (url) => {
    console.log(`Mock GET: ${url}`);
    return new Promise((resolve) => {
      // Simuler un délai réseau
      setTimeout(() => {
        if (url.includes('/api/dashboard/stats')) {
          resolve({ data: mockData.dashboardStats });
        } else if (url.includes('/api/candidates/recent')) {
          resolve({ data: mockData.recentCandidates });
        } else if (url.includes('/api/dashboard/sources')) {
          resolve({ data: mockData.sourcesData });
        } else if (url.includes('/api/jobs/active') || url.includes('/api/jobs?status=ACTIVE')) {
          resolve({ data: mockData.jobs });
        } else if (url.includes('/api/cv/') && url.includes('/analyze/progress/')) {
          resolve({ data: {
            progress: 100,
            completed: true,
            results: mockData.analyzedCandidates,
            stats: mockData.analyzedStats
          }});
        } else if (url.includes('/api/cv/') && !url.includes('/download/')) {
          resolve({ data: mockData.candidateDetail });
        } else if (url.includes('/api/auth/me')) {
          resolve({ data: mockData.users.currentUser });
        } else {
          resolve({ data: {} });
        }
      }, 800);
    });
  },
  post: (url, data) => {
    console.log(`Mock POST: ${url}`, data);
    return new Promise((resolve) => {
      // Simuler un délai réseau
      setTimeout(() => {
        if (url.includes('/api/auth/login')) {
          resolve({ 
            data: {
              token: 'mock-jwt-token',
              user: mockData.users.currentUser
            }
          });
        } else if (url.includes('/api/cv/analyze')) {
          resolve({ data: { analysisId: 'mock-analysis-id' } });
        } else {
          resolve({ data: {} });
        }
      }, 800);
    });
  },
  put: (url, data) => {
    console.log(`Mock PUT: ${url}`, data);
    return new Promise(resolve => {
      setTimeout(() => resolve({ data: {} }), 800);
    });
  },
  delete: (url) => {
    console.log(`Mock DELETE: ${url}`);
    return new Promise(resolve => {
      setTimeout(() => resolve({ data: {} }), 800);
    });
  }
};

// Déterminer si nous sommes en mode mock
const isMockMode = true; // Changer à false pour utiliser le backend réel

// Exporté l'instance axios ou le mock
export default isMockMode ? mockAPI : instance;