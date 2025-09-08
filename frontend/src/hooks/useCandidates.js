// frontend/src/hooks/useCandidates.js

import { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// // Configuration axios avec interceptors pour les erreurs
// const axios = axios.create({
//   baseURL: API_BASE_URL,
// });

// // Intercepteur pour ajouter le token d'authentification
// axios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

import axios from '../utils/axios';

// Hook pour les détails d'un candidat
export const useCandidate = (companyId, candidateId) => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCandidate = useCallback(async () => {
    if (!companyId || !candidateId) return;

    try {
      setLoading(true);
    //    /candidates/companies/${companyId}/candidates/${id}
     
      const response = await axios.get(`/candidates/companies/${companyId}/candidates/${candidateId}`);
      console.log("response candidate: ",response.data);
      setCandidate(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidate');
      console.error('Error fetching candidate:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, candidateId]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  return { candidate, loading, error, refetch: fetchCandidate };
};

// Hook pour les commentaires d'un candidat
export const useCandidateComments = (companyId, candidateId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async (page = 1, limit = 10) => {
    if (!companyId || !candidateId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/candidates/companies/${companyId}/candidates/${candidateId}/comments`, {
        params: { page, limit }
      });
      setComments(response.data.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, candidateId]);

  const addComment = async (commentData) => {
    try {
      const response = await axios.post(
        `/candidates/companies/${companyId}/candidates/${candidateId}/comments`,
        commentData
      );
      
      // Ajouter le nouveau commentaire au début de la liste
      setComments(prev => [response.data.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
      throw err;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    fetchComments,
    addComment
  };
};

// Hook pour les fichiers d'un candidat
export const useCandidateFiles = (companyId, candidateId) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    if (!companyId || !candidateId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/candidates/companies/${companyId}/candidates/${candidateId}/files`);
      setFiles(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, candidateId]);

  const uploadFile = async (file, visibility = 'PUBLIC') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('visibility', visibility);

      const response = await axios.post(
        `/candidates/companies/${companyId}/candidates/${candidateId}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Ajouter le nouveau fichier à la liste
      setFiles(prev => [response.data.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
      throw err;
    }
  };

  const deleteFile = async (fileId) => {
    try {
      await axios.delete(`/candidates/companies/${companyId}/candidates/${candidateId}/files/${fileId}`);
      
      // Retirer le fichier de la liste
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete file');
      throw err;
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile
  };
};

// Hook pour l'activité d'un candidat
export const useCandidateActivity = (companyId, candidateId) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchActivities = useCallback(async (page = 1, limit = 20) => {
    if (!companyId || !candidateId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/candidates/companies/${companyId}/candidates/${candidateId}/activity`, {
        params: { page, limit }
      });
      setActivities(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, candidateId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    pagination,
    fetchActivities
  };
};

// Hook pour les emails/messages d'un candidat
export const useCandidateEmails = (companyId, candidateId) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmails = useCallback(async (page = 1, limit = 10) => {
    if (!companyId || !candidateId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/candidates/companies/${companyId}/candidates/${candidateId}/emails`, {
        params: { page, limit }
      });
      setEmails(response.data.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch emails');
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, candidateId]);

  const sendEmail = async (emailData) => {
    try {
      const response = await axios.post(
        `/candidates/companies/${companyId}/candidates/${candidateId}/emails`,
        emailData
      );
      
      // Ajouter le nouvel email à la liste
      setEmails(prev => [response.data.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
      throw err;
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return {
    emails,
    loading,
    error,
    fetchEmails,
    sendEmail
  };
};

// Hook pour les ratings d'un candidat
export const useCandidateRatings = (companyId, candidateId) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRatings = useCallback(async () => {
    if (!companyId || !candidateId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/candidates/companies/${companyId}/candidates/${candidateId}/ratings`);
      setRatings(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch ratings');
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, candidateId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  return {
    ratings,
    loading,
    error,
    fetchRatings
  };
};

// Hook pour les réunions
export const useCandidateMeetings = (companyId, candidateId) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scheduleMeeting = async (meetingData) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `/candidates/companies/${companyId}/candidates/${candidateId}/meetings`,
        meetingData
      );
      
      // Ajouter la nouvelle réunion à la liste
      setMeetings(prev => [response.data.data, ...prev]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    meetings,
    loading,
    error,
    scheduleMeeting
  };
};

// Hook pour déplacer un candidat vers un autre stage
export const useCandidateStageManagement = (companyId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const moveCandidateToStage = async (candidateId, stageId, comment = null) => {
    try {
      setLoading(true);
      console.log("moveCandidateToStage: ",stageId);
      const response = await axios.post(
        `/candidates/companies/${companyId}/candidates/${candidateId}/move-to-stage`,
        { stageId, comment }
      );
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to move candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    moveCandidateToStage,
    loading,
    error
  };
};

// Hook pour obtenir les candidats par stage
export const useCandidatesByStage = (companyId, stageId) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCandidatesByStage = useCallback(async () => {
    if (!companyId || !stageId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/candidates/companies/${companyId}/stages/${stageId}/candidates`);
      setCandidates(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidates');
      console.error('Error fetching candidates by stage:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, stageId]);

  useEffect(() => {
    fetchCandidatesByStage();
  }, [fetchCandidatesByStage]);

  return {
    candidates,
    loading,
    error,
    refetch: fetchCandidatesByStage
  };
};

// Hook principal pour la gestion complète d'un candidat
export const useCandidateManagement = (companyId, candidateId) => {
  const candidate = useCandidate(companyId, candidateId);
  const comments = useCandidateComments(companyId, candidateId);
  const files = useCandidateFiles(companyId, candidateId);
  const activities = useCandidateActivity(companyId, candidateId);
  const emails = useCandidateEmails(companyId, candidateId);
  const ratings = useCandidateRatings(companyId, candidateId);
  const meetings = useCandidateMeetings(companyId, candidateId);
  const stageManagement = useCandidateStageManagement(companyId);
  

  // Fonction pour rafraîchir toutes les données
  const refreshAll = useCallback(async () => {
    await Promise.all([
      candidate.refetch(),
      comments.fetchComments(),
      files.fetchFiles(),
      activities.fetchActivities(),
      emails.fetchEmails(),
      ratings.fetchRatings()
    ]);
  }, [candidate, comments, files, activities, emails, ratings]);

  return {
    candidate,
    comments,
    files,
    activities,
    emails,
    ratings,
    meetings,
    stageManagement,
    refreshAll,
    // Loading global
    loading: candidate.loading || comments.loading || files.loading || 
             activities.loading || emails.loading || ratings.loading || meetings.loading,
    // Erreur globale
    error: candidate.error || comments.error || files.error || 
           activities.error || emails.error || ratings.error || meetings.error
  };
};