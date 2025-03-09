import axios from '../utils/axios';

export const authService = {
  login: async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  register: async (data) => {
    const response = await axios.post('/api/auth/register', data);
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await axios.post('/api/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await axios.post('/api/auth/reset-password', { token, password });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await axios.get('/api/auth/me');
    return response.data;
  },
  
  logout: async () => {
    const response = await axios.post('/api/auth/logout');
    return response.data;
  }
};

export const cvService = {
  uploadCV: async (files, jobId = null) => {
    const formData = new FormData();
    
    if (jobId) {
      formData.append('jobId', jobId);
    }
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    const response = await axios.post('/api/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  analyzeCV: async (cvId, jobId) => {
    const response = await axios.post('/api/cv/analyze-single', { cvId, jobId });
    return response.data;
  },
  
  analyzeBatch: async (files, jobId) => {
    const formData = new FormData();
    formData.append('jobId', jobId);
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    const response = await axios.post('/api/cv/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.analysisId;
  },
  
  getAnalysisProgress: async (analysisId) => {
    const response = await axios.get(`/api/cv/analyze/progress/${analysisId}`);
    return response.data;
  },
  
  getCVById: async (id) => {
    const response = await axios.get(`/api/cv/${id}`);
    return response.data;
  },
  
  downloadCV: async (id) => {
    try {
      const response = await axios.get(`/api/cv/download/${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cv_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CV:', error);
    }
  }
};

export const jobService = {
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.page !== undefined) params.append('page', filters.page);
    if (filters.size !== undefined) params.append('size', filters.size);
    
    const response = await axios.get(`/api/jobs?${params.toString()}`);
    return response.data;
  },
  
  getJobById: async (id) => {
    const response = await axios.get(`/api/jobs/${id}`);
    return response.data;
  },
  
  createJob: async (data) => {
    const response = await axios.post('/api/jobs', data);
    return response.data;
  },
  
  updateJob: async (id, data) => {
    const response = await axios.put(`/api/jobs/${id}`, data);
    return response.data;
  },
  
  deleteJob: async (id) => {
    const response = await axios.delete(`/api/jobs/${id}`);
    return response.data;
  },
  
  generateJobDescription: async (title, requirements) => {
    const response = await axios.post('/api/jobs/generate-description', { title, requirements });
    return response.data;
  }
};

export const interviewService = {
  getInterviews: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    
    const response = await axios.get(`/api/interviews?${params.toString()}`);
    return response.data;
  },
  
  getInterviewById: async (id) => {
    const response = await axios.get(`/api/interviews/${id}`);
    return response.data;
  },
  
  scheduleInterview: async (data) => {
    const response = await axios.post('/api/interviews', data);
    return response.data;
  },
  
  updateInterview: async (id, data) => {
    const response = await axios.put(`/api/interviews/${id}`, data);
    return response.data;
  },
  
  cancelInterview: async (id, reason) => {
    const response = await axios.post(`/api/interviews/${id}/cancel`, { reason });
    return response.data;
  },
  
  generateInterviewQuestions: async (candidateId, jobId) => {
    const response = await axios.post('/api/interviews/generate-questions', { candidateId, jobId });
    return response.data;
  }
};

export const dashboardService = {
  getStats: async (period = '30days') => {
    const response = await axios.get('/api/dashboard/stats', { params: { period } });
    return response.data;
  },
  
  getRecentCandidates: async (limit = 5) => {
    const response = await axios.get('/api/candidates/recent', { params: { limit } });
    return response.data;
  },
  
  getRecruitmentSources: async () => {
    const response = await axios.get('/api/dashboard/sources');
    return response.data;
  }
};