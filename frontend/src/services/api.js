import axios from '../utils/axios';


export const authService = {
  login: async (email, password) => {
    const response = await axios.post('/auth/login', { email, password });
    const { data } = response.data; // Déstructure data
    const { user, token } = data; // Déstructure user et token
    return { user, token }; // Retourne l'objet attendu
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

// export const cvService = {
//   uploadCV: async (files, jobId = null) => {
//     const formData = new FormData();
    
//     if (jobId) {
//       formData.append('jobId', jobId);
//     }
    
//     Array.from(files).forEach(file => {
//       formData.append('files', file);
//     });
    
//     const response = await axios.post('/api/cv/upload', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
    
//     return response.data;
//   },
  
//   analyzeCV: async (cvId, jobId) => {
//     const response = await axios.post('/api/cv/analyze-single', { cvId, jobId });
//     return response.data;
//   },
  
//   analyzeBatch: async (files, jobId) => {
//     const formData = new FormData();
//     formData.append('jobId', jobId);
    
//     Array.from(files).forEach(file => {
//       formData.append('files', file);
//     });
    
//     const response = await axios.post('/api/cv/analyze', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
    
//     return response.data.analysisId;
//   },
  
//   getAnalysisProgress: async (analysisId) => {
//     const response = await axios.get(`/api/cv/analyze/progress/${analysisId}`);
//     return response.data;
//   },

//   // Nouvelle méthode pour obtenir tous les candidats
//   getCandidates: async (filters = {}) => {
//     try {
//       const params = new URLSearchParams();

//       if (filters.status) params.append('status', filters.status);
//       if (filters.skills) params.append('skills', filters.skills.join(','));
//       if (filters.minScore) params.append('minScore', filters.minScore);

//       const response = await axios.get(`/api/candidates?${params.toString()}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching candidates:', error);
//       throw error;
//     }
//   },

//   // Méthode mise à jour pour obtenir les détails d'un candidat
//   getCVById: async (id) => {
//     try {
//       const response = await axios.get(`/api/cv/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching CV details:', error);
//       throw error;
//     }
//   },
  
//   downloadCV: async (id) => {
//     try {
//       const response = await axios.get(`/api/cv/download/${id}`, {
//         responseType: 'blob'
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `cv_${id}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       console.error('Error downloading CV:', error);
//     }
//   }
// };





export const getCandidates = async (companyId) => {
  try {
        
    const response = await axios.get(`/candidates/companies/${companyId}/candidates`);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
};

export const getCandidateById = async (companyId, id) => {
  try {
    const response = await axios.get(`/candidates/companies/${companyId}/candidates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching candidate:', error);
    throw error;
  }
};

export const createCandidate = async (companyId, candidateData) => {
  try {
    
    const response = await axios.post(`/candidates/companies/${companyId}/candidates`, candidateData,
      {
        headers: { "Content-Type": "multipart/form-data" }, 
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }
};

export const updateCandidate = async (companyId, id, candidateData) => {
  try {
    const response = await axios.put(`/candidates/companies/${companyId}/candidates/${id}`, candidateData);
    return response.data;
  } catch (error) {
    console.error('Error updating candidate:', error);
    throw error;
  }
};

export const deleteCandidate = async (companyId, id) => {
  try {
    const response = await axios.delete(`/candidates/companies/${companyId}/candidates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting candidate:', error);
    throw error;
  }
};

export const downloadCV = async (id) => {
  try {
  
    const response = await axios.get(`/candidates/candidates/${id}/download-cv`);
    return response.data.url;
  } catch (error) {
    console.error('Error downloading CV:', error);
    throw error;
  }
};

export const jobService = {
  

  getJobs: async (companyId, params = {}) => {
    try {
      const response = await axios.get(`/jobs/companies/${companyId}/jobs`, { params });
    
      // Le backend renvoie { data: jobs, currentPage, totalPages, totalJobs }
      return response.data.data; // On retourne uniquement le tableau des jobs
    } catch (error) {
      console.error('Erreur lors de la récupération des jobs:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getJobById: async (companyId, jobId) => {
    try {
      const response = await axios.get(`/jobs/companies/${companyId}/jobs/${jobId}`);
      return response.data.data; // Le backend renvoie { data: job }
    } catch (error) {
      console.error(`Erreur lors de la récupération du job ${jobId}:`, error.response?.data || error.message);
      throw error;
    }
  },


  getDepartments: async () => {
    try {
      const response = await axios.get('/api/jobs/departments');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des départements:', error);
      // Pour le développement, retourne des données simulées
      if (process.env.NODE_ENV === 'development') {
        return [
          { id: '1', name: 'Support Client' },
          { id: '2', name: 'Finance' },
          { id: '3', name: 'Ressources Humaines' },
          { id: '4', name: 'Informatique' },
          { id: '5', name: 'Juridique' },
          { id: '6', name: 'Marketing' },
          { id: '7', name: 'Ventes' },
          { id: '8', name: 'Ingénierie' },
          { id: '9', name: 'Produit' }
        ];
      }
      throw error;
    }
  },

   

  createJob: async (companyId, jobData) => {
    try {
      console.log('Sending job data:', jobData); // Débogage
      const response = await axios.post(`/jobs/companies/${companyId}/jobs`, jobData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating job:', error.response?.data || error);
      throw error;
    }
  },

  // Mettre à jour un job
  updateJob: async (companyId, jobId, jobData) => {
    try {
      const response = await axios.put(`/jobs/companies/${companyId}/jobs/${jobId}`, jobData);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du job ${jobId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  deleteJob: async (companyId, jobId) => {
    try {
      const response = await axios.delete(`/jobs/companies/${companyId}/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du job ${jobId}:`, error.response?.data || error.message);
      throw error;
    }
  },
  getHiringTeam: async (companyId, jobId) => {
    try {
      const response = await axios.get(`/jobs/companies/${companyId}/jobs/${jobId}/hiring-team`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'équipe de recrutement pour le job ${jobId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  addHiringMember: async (companyId, jobId, memberData) => {
    try {
      const response = await axios.post(`/jobs/companies/${companyId}/jobs/${jobId}/hiring-team`, memberData);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'un membre à l'équipe de recrutement pour le job ${jobId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  removeHiringMember: async (companyId, jobId, memberId) => {
    try {
      const response = await axios.delete(`/jobs/companies/${companyId}/jobs/${jobId}/hiring-team/${memberId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression d'un membre de l'équipe de recrutement pour le job ${jobId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  generateJobDescription: async (title, requirements) => {
    try {
      const response = await axios.post('/api/jobs/generate-description', { title, requirements });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération de la description du job:', error.response?.data || error.message);
      throw error;
    }
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


// Nouveau service pour les messages
export const messageService = {
  getConversations: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.filter) params.append('filter', filters.filter);

      const response = await axios.get(`/api/messages/conversations?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  getMessages: async (conversationId) => {
    try {
      const response = await axios.get(`/api/messages/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const response = await axios.post(`/api/messages/conversations/${conversationId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

// Nouveau service pour le dashboard
export const dashboardService = {
  getDashboardData: async () => {
    try {
      const response = await axios.get('/api/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

// Workflow service
 
const getCompanyId = () => {
  // Example: Retrieve from user context or local storage
  return localStorage.getItem('companyId') ; // Placeholder
};
export const workflowService = {
  // Récupérer les workflows pour une entreprise spécifique
  getWorkflows: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('companyId est requis');
      }
      const response = await axios.get(`/workflows/companies/${companyId}/templates`);
       
      return response.data.data; // Le backend renvoie les données dans `data`
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error.response?.data || error;
    }
  },

  // Créer un nouveau workflow

  

  createWorkflow: async (companyId, data) => {
    try {
      if (!companyId) throw new Error('companyId est requis pour createWorkflow');
      if (!data.name) throw new Error('Le nom du workflow est requis');
      
      

      const payload = {
        name: data.name,
        type: 'RECRUITMENT', // Valeur par défaut
        stages: [
          {
            name: 'Initial Review',
            type: 'AI_SCREENING', // Valeur par défaut, doit correspondre à StageType
            order: 0,
            settings: {},
          },
        ],
      };

      const response = await axios.post(`/workflows/companies/${companyId}/templates`, payload);
      console.log("response.data.data",response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error.response?.data || error;
    }
  },


  // Mettre à jour un workflow
  updateWorkflow: async (companyId, id, data) => {
    try {
      if (!companyId || !id) {
        throw new Error('companyId et id sont requis');
      }
      const response = await axios.put(`/workflows/companies/${companyId}/templates/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error.response?.data || error;
    }
  },

  // Récupérer les stages d'un workflow
  getWorkflowStages: async (companyId, workflowId) => {
    try {
      if (!companyId || !workflowId) {
        throw new Error('companyId et workflowId sont requis');
      }

      const response2 = await axios.get(`/workflows/companies/${companyId}/templates`)
      console.log("getWorkflows",response2);

      const response1 = await axios.get(
        `workflows/companies/${companyId}/templates/${workflowId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const stages = response1.data.data.stages || [];
      console.log('Fetched stages response1:', stages); // Débogage

      return stages;
     
    } catch (error) {
      console.error('Error fetching workflow stages:', error);
      if (process.env.NODE_ENV === 'development') {
        return [
          { id: '1', name: 'Initial Review', type: 'SCREENING', order: 0 },
          { id: '2', name: 'Interview', type: 'INTERVIEW', order: 1 },
        ];
      }
      throw error.response?.data || error;
    }
  },

  // Créer un nouveau stage
  createWorkflowStage: async (companyId, workflowId, stageData) => {
    try {
      if (!companyId || !workflowId) {
        throw new Error('companyId et workflowId sont requis');
      }
      const templateResponse = await axios.get(`/workflows/companies/${companyId}/templates/${workflowId}`);
      const currentStages = templateResponse.data.data.stages || [];
      const newStage = {
        name: stageData.name,
        type: stageData.type || 'AI_SCREENING',
        order: stageData.order || currentStages.length,
        settings: stageData.settings || {},
      };
      const updatedStages = [...currentStages, newStage];
      const response = await axios.put(`/workflows/companies/${companyId}/templates/${workflowId}`, {
        stages: updatedStages,
      });
      return response.data.data.stages.find((stage) => stage.name === newStage.name);
    } catch (error) {
      console.error('Error creating workflow stage:', error);
      throw error.response?.data || error;
    }
  },

  // Mettre à jour un stage
  async updateWorkflowStage(companyId, workflowId, stageId, stageData) {
    try {
      if (!companyId || !workflowId || !stageId) {
        throw new Error('companyId, workflowId et stageId sont requis');
      }
      const templateResponse = await axios.get(
        `http://localhost:5000/api/v1/workflows/companies/${companyId}/templates/${workflowId}`, // Ajoute le port si nécessaire
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      console.log('Template response:', templateResponse.data); // Débogage
      const currentStages = templateResponse.data.data.stages || [];
      const updatedStages = currentStages.map((stage) =>
        stage.id === stageId ? { ...stage, ...stageData } : stage
      );
      const response = await axios.put(
        `http://localhost:5000/api/v1/workflows/companies/${companyId}/templates/${workflowId}`,
        { stages: updatedStages },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      console.log('PUT response:', response.data); // Débogage
      const updatedStage = response.data.data?.stages?.find((stage) => stage.id === stageId) || updatedStages.find((stage) => stage.id === stageId);
      if (!updatedStage) {
        throw new Error('Étape mise à jour non trouvée dans la réponse');
      }
      return updatedStage;
    } catch (error) {
      console.error('Error updating workflow stage:', error);
      throw error.response?.data || error;
    }
  },

  // Supprimer un stage
  deleteWorkflowStage: async (companyId, workflowId, stageId) => {
    try {
      if (!companyId || !workflowId || !stageId) {
        throw new Error('companyId, workflowId et stageId sont requis');
      }
      const templateResponse = await axios.get(`/workflows/companies/${companyId}/templates/${workflowId}`);
      const currentStages = templateResponse.data.data.stages || [];
      const updatedStages = currentStages
        .filter((stage) => stage.id !== stageId)
        .map((stage, index) => ({ ...stage, order: index })); // Réajuster les ordres
      const response = await axios.put(`/workflows/companies/${companyId}/templates/${workflowId}`, {
        stages: updatedStages,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error deleting workflow stage:', error);
      throw error.response?.data || error;
    }
  },
};



// Mock data pour le développement
function getMockStages(workflowId) {
  if (workflowId === 'default' || workflowId === 1) {
    return [
      { id: 'stage-1', name: 'Leads', type: 'lead', dueDays: 3, order: 0 },
      { id: 'stage-2', name: 'Applicants', type: 'applied', dueDays: 3, order: 1 },
      { id: 'stage-3', name: 'Short List', type: 'review', dueDays: 2, order: 2 },
      { id: 'stage-4', name: 'Screening Call', type: 'interview', dueDays: 14, order: 3 },
      { id: 'stage-5', name: 'Interview', type: 'interview', dueDays: 14, order: 4 },
      { id: 'stage-6', name: 'Final review', type: 'review', dueDays: 14, order: 5 },
      { id: 'stage-7', name: 'Offer', type: 'offer', dueDays: 14, order: 6 },
      { id: 'stage-8', name: 'Hired', type: 'hired', dueDays: null, order: 7 },
      { id: 'stage-9', name: 'Disqualified', type: 'disqualified', dueDays: null, order: 8 },
      { id: 'stage-10', name: 'Archived', type: 'none', dueDays: null, order: 9 }
    ];
  } else {
    // Pour les autres workflows, retourner une version simplifiée
    return [
      { id: `${workflowId}-stage-1`, name: 'Leads', type: 'lead', dueDays: 3, order: 0 },
      { id: `${workflowId}-stage-2`, name: 'Applicants', type: 'applied', dueDays: 3, order: 1 },
      { id: `${workflowId}-stage-3`, name: 'Interview', type: 'interview', dueDays: 14, order: 2 },
      { id: `${workflowId}-stage-4`, name: 'Hired', type: 'hired', dueDays: null, order: 3 }
    ];
  }
}

// Service pour les templates d'entretien
// export const meetingTemplateService = {
//   getMeetingTemplates: async () => {
//     try {
//       const response = await axios.get('/api/meeting-templates');
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors du chargement des templates d\'entretien:', error);
//       // Pour le développement, retourner des données simulées
//       if (process.env.NODE_ENV === 'development') {
//         return getMockMeetingTemplates();
//       }
//       throw error;
//     }
//   },

//   getMeetingTemplateById: async (id) => {
//     try {
//       const response = await axios.get(`/api/meeting-templates/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`Erreur lors du chargement du template d'entretien ${id}:`, error);
//       throw error;
//     }
//   },

//   createMeetingTemplate: async (data) => {
//     try {
//       const response = await axios.post('/scheduling/companies/:companyId/meeting-templates', data);
//       console.log("response.data",response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la création du template d\'entretien:', error);
//       throw error;
//     }
//   },

//   updateMeetingTemplate: async (id, data) => {
//     try {
//       const response = await axios.put(`/api/meeting-templates/${id}`, data);
//       return response.data;
//     } catch (error) {
//       console.error(`Erreur lors de la mise à jour du template d'entretien ${id}:`, error);
//       throw error;
//     }
//   },

//   deleteMeetingTemplate: async (id) => {
//     try {
//       const response = await axios.delete(`/api/meeting-templates/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`Erreur lors de la suppression du template d'entretien ${id}:`, error);
//       throw error;
//     }
//   }
// };

export const meetingTemplateService = {
  getRatingCards: async (companyId) => {
    try {
      const response = await axios.get(`/ratings/companies/${companyId}/rating-card-templates`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des fiches d\'évaluation:', error);
      throw error;
    }
  },
  getMeetingTemplates: async (companyId) => {
    try {
      const response = await axios.get(`/scheduling/companies/${companyId}/meeting-templates`);
      return response.data.data; // Ajuste selon la structure de réponse du backend
    } catch (error) {
      console.error('Erreur lors du chargement des templates d\'entretien:', error);
      if (process.env.NODE_ENV === 'development') {
        return getMockMeetingTemplates();
      }
      throw error;
    }
  },

  getMeetingTemplateById: async (companyId, id) => {
    try {
      const response = await axios.get(`/scheduling/companies/${companyId}/meeting-templates/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors du chargement du template d'entretien ${id}:`, error);
      throw error;
    }
  },

  createMeetingTemplate: async (companyId, data) => {
    try {
      const response = await axios.post(`/scheduling/companies/${companyId}/meeting-templates`, data);
      console.log("response.data", response.data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la création du template d\'entretien:', error);
      throw error;
    }
  },

  updateMeetingTemplate: async (companyId, id, data) => {
    try {
      const response = await axios.put(`/scheduling/companies/${companyId}/meeting-templates/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du template d'entretien ${id}:`, error);
      throw error;
    }
  },

  deleteMeetingTemplate: async (companyId, id) => {
    try {
      const response = await axios.delete(`/scheduling/companies/${companyId}/meeting-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du template d'entretien ${id}:`, error);
      throw error;
    }
  }

};



// Service de templates de messages


export const messageTemplateService = {
  getMessageTemplates: async (companyId) => {
    try {
      const response = await axios.get(`/messagingTemplate/companies/${companyId}/message-templates`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des templates de messages:', error);
      throw error;
    }
  },

  getMessageTemplateById: async (companyId, id) => {
    try {
      const response = await axios.get(`/messagingTemplate/companies/${companyId}/message-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du template ${id}:`, error);
      throw error;
    }
  },

  createMessageTemplate: async (companyId, templateData) => {
    try {
      const response = await axios.post(`/messagingTemplate/companies/${companyId}/message-templates`, templateData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      throw error;
    }
  },

  updateMessageTemplate: async (companyId, id, templateData) => {
    try {
      const response = await axios.put(`/messagingTemplate/companies/${companyId}/message-templates/${id}`, templateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du template ${id}:`, error);
      throw error;
    }
  },

  deleteMessageTemplate: async (companyId, id) => {
    try {
      const response = await axios.delete(`/messagingTemplate/companies/${companyId}/message-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du template ${id}:`, error);
      throw error;
    }
  }
};




// // Service de questions
// export const questionService = {
//   getCustomQuestions: async () => {
//     try {
//       const response = await axios.get('/api/questions/custom');
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la récupération des questions personnalisées:', error);
//       // Pour les besoins de développement, renvoyer des données simulées si le backend n'est pas encore prêt
//       if (process.env.NODE_ENV === 'development') {
//         return getMockQuestions();
//       }
//       throw error;
//     }
//   },

//   getQuestionSets: async () => {
//     try {
//       const response = await axios.get('/api/questions/sets');
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la récupération des ensembles de questions:', error);
//       // Pour les besoins de développement, renvoyer des données simulées si le backend n'est pas encore prêt
//       if (process.env.NODE_ENV === 'development') {
//         return [];
//       }
//       throw error;
//     }
//   },

//   createQuestion: async (questionData) => {
//     try {
//       const response = await axios.post('/api/questions', questionData);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la création de la question:', error);
//       throw error;
//     }
//   },

//   updateQuestion: async (id, questionData) => {
//     try {
//       const response = await axios.put(`/api/questions/${id}`, questionData);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la mise à jour de la question:', error);
//       throw error;
//     }
//   },

//   deleteQuestion: async (id) => {
//     try {
//       const response = await axios.delete(`/api/questions/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la suppression de la question:', error);
//       throw error;
//     }
//   },

//   createQuestionSet: async (setData) => {
//     try {
//       const response = await axios.post('/api/questions/sets', setData);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la création de l\'ensemble de questions:', error);
//       throw error;
//     }
//   }
// };

 
// Service de questions
export const questionService = {
  getCustomQuestions: async (companyId) => {
    try {
      const response = await axios.get(`/questions/companies/${companyId}/questions/custom`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des questions personnalisées:', error);
      throw error;
    }
  },

  getQuestionSets: async (companyId) => {
    try {
      const response = await axios.get(`/questions/companies/${companyId}/questions/sets`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des ensembles de questions:', error);
      throw error;
    }
  },

  createQuestion: async (companyId, questionData) => {
    try {
      const response = await axios.post(`/questions/companies/${companyId}/questions`, questionData);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la création de la question:', error);
      throw error;
    }
  },

  updateQuestion: async (companyId, id, questionData) => {
    try {
      const response = await axios.put(`/questions/companies/${companyId}/questions/${id}`, questionData);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la question:', error);
      throw error;
    }
  },

  deleteQuestion: async (companyId, id) => {
    try {
      const response = await axios.delete(`/questions/companies/${companyId}/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la question:', error);
      throw error;
    }
  },

  createQuestionSet: async (companyId, setData) => {
    try {
      const response = await axios.post(`/questions/companies/${companyId}/questions/sets`, setData);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'ensemble de questions:', error);
      throw error;
    }
  },
  updateQuestionSet: async (companyId, id, setData) => {
    try {
      const response = await axios.put(`/questions/companies/${companyId}/questions/sets/${id}`, setData);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ensemble de questions:', error);
      throw error;
    }
  },

  deleteQuestionSet: async (companyId, id) => {
    try {
      const response = await axios.delete(`/questions/companies/${companyId}/questions/sets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ensemble de questions:', error);
      throw error;
    }
  }
};

// Données simulées pour le développement
function getMockQuestions() {
  return [
    {
      id: 'q1',
      text: 'Décrivez votre personnalité en quelques phrases.',
      responseType: 'short_text',
      visibility: 'public'
    },
    {
      id: 'q2',
      text: 'Décrivez votre travail idéal.',
      responseType: 'paragraph',
      visibility: 'public'
    },
    {
      id: 'q3',
      text: 'Quelles sont vos attentes salariales?',
      responseType: 'short_text',
      visibility: 'private'
    },
    {
      id: 'q4',
      text: 'Qu\'écoutez-vous pendant que vous travaillez?',
      responseType: 'short_text',
      visibility: 'public'
    },
    {
      id: 'q5',
      text: 'Que faites-vous pendant votre temps libre?',
      responseType: 'short_text',
      visibility: 'public'
    },
    {
      id: 'q6',
      text: 'Qu\'est-ce qui vous enthousiasme le plus dans ce poste?',
      responseType: 'paragraph',
      visibility: 'public'
    },
    {
      id: 'q7',
      text: 'Qu\'est-ce qui vous motive?',
      responseType: 'short_text',
      visibility: 'public'
    },
    {
      id: 'q8',
      text: 'Que devrions-nous absolument savoir sur vous?',
      responseType: 'paragraph',
      visibility: 'public'
    },
    {
      id: 'q9',
      text: 'Quelle est votre passion en dehors du travail?',
      responseType: 'short_text',
      visibility: 'public'
    }
  ]
}

// Service pour les fiches d'évaluation
export const ratingCardService = {
  // Get all rating card templates for a company
  async getRatingCards(companyId) {
    try {
      const response = await axios.get(`/ratings/companies/${companyId}/rating-card-templates`);
      return response.data.data; // Backend returns templates in `data`
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des fiches d\'évaluation');
    }
  },

  // Get a specific rating card template by ID
  async getRatingCardById(companyId, templateId) {
    try {
      const response = await axios.get(`/ratings/companies/${companyId}/rating-card-templates/${templateId}`);
      return response.data.data; // Backend returns template in `data`
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la fiche d\'évaluation');
    }
  },

  // Create a new rating card template
  async createRatingCard(companyId, ratingCardData) {
    try {
      const response = await axios.post(`/ratings/companies/${companyId}/rating-card-templates`, ratingCardData);
      return response.data.data; // Backend returns created template in `data`
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la fiche d\'évaluation');
    }
  },

  // Update an existing rating card template
  async updateRatingCard(companyId, templateId, ratingCardData) {
    try {
      const response = await axios.put(`/ratings/companies/${companyId}/rating-card-templates/${templateId}`, ratingCardData);
      return response.data.data; // Backend returns updated template in `data`
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la fiche d\'évaluation');
    }
  },

  // Delete a rating card template
  async deleteRatingCard(companyId, templateId) {
    try {
      await axios.delete(`/ratings/companies/${companyId}/rating-card-templates/${templateId}`);
      return { message: 'Fiche d\'évaluation supprimée avec succès' };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la fiche d\'évaluation');
    }
  },
};
 

// Données simulées pour le développement
function getMockMeetingTemplates() {
  return [
    {
      id: 'template-1',
      name: 'Template d\'entretien par défaut',
      title: 'Premier entretien',
      duration: '30 minutes',
      type: 'Visioconférence',
      content: 'Introduction:\n- Présentation de l\'entreprise\n- Présentation du poste\n\nQuestions sur l\'expérience:\n- Parcours professionnel\n- Compétences techniques\n\nQuestions comportementales:\n- Exemples de situations difficiles\n- Travail en équipe\n\nConclusion:\n- Questions du candidat\n- Prochaines étapes',
      ratingCardId: 'rating-1',
      isDefault: true
    }
  ];
}

function getMockRatingCards() {
  return [
    {
      id: 'rating-1',
      name: 'Fiche d\'évaluation technique',
    },
    {
      id: 'rating-2',
      name: 'Fiche d\'évaluation comportementale',
    },
    {
      id: 'rating-3',
      name: 'Fiche d\'évaluation générale',
    }
  ];
}


// Service pour les paramètres d'entreprise
// export const companyService = {

//   getDepartments: async () => {
//     try {
//       const response = await axios.get('/companies');
      
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la récupération des départements:', error);

//       // Pour le développement, retourner des données simulées
//       if (process.env.NODE_ENV === 'development') {
//         return [
//           { id: '1', name: 'Support Client (CS)' },
//           { id: '2', name: 'Finance' },
//           { id: '3', name: 'Ressources Humaines (RH)' },
//           { id: '4', name: 'Informatique (IT)' },
//           { id: '5', name: 'Juridique' },
//           { id: '6', name: 'Marketing' },
//           { id: '7', name: 'Produit' },
//           { id: '8', name: 'Ventes' },
//           { id: '9', name: 'Ingénierie Logicielle' }
//         ];
//       }

//       throw error;
//     }
//   },

//   createDepartment: async (data) => {
//     try {
//       const response = await axios.post('/api/company/departments', data);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la création du département:', error);

//       // Pour le développement
//       if (process.env.NODE_ENV === 'development') {
//         return {
//           id: Date.now().toString(),
//           name: data.name
//         };
//       }

//       throw error;
//     }
//   },

//   updateDepartment: async (id, data) => {
//     try {
//       const response = await axios.put(`/api/company/departments/${id}`, data);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la mise à jour du département:', error);
//       throw error;
//     }
//   },

//   deleteDepartment: async (id) => {
//     try {
//       const response = await axios.delete(`/api/company/departments/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la suppression du département:', error);
//       throw error;
//     }
//   },
//   getCompanyProfile: async () => {
//     try {
//       const response = await axios.get('/api/company/profile');
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la récupération du profil d\'entreprise:', error);
//       // Pour le développement, retourner des données simulées
//       if (process.env.NODE_ENV === 'development') {
//         return {
//           name: 'RecrutPME',
//           website: 'https://www.recruitpme.fr',
//           phone: '01 23 45 67 89'
//         };
//       }
//       throw error;
//     }
//   },

//   updateCompanyProfile: async (data) => {
//     try {
//       const response = await axios.put('/api/company/profile', data);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la mise à jour du profil d\'entreprise:', error);
//       throw error;
//     }
//   },

//    createCompany: async (companyData)  => {
//     try {
//       const response = await axios.post('/companies', companyData);
//       console.log('Données de l\'entreprise à créer:', response.data);

//       return response.data;
      

//     } catch (error) {
//       console.error('Erreur lors de la creatione d\'entreprise:', error);
//       throw error;
//     }
     
//   },

//   getCompanyLocations: async () => {
//     try {
//       const response = await axios.get('/api/company/locations');
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la récupération des emplacements:', error);
//       // Pour le développement, retourner des données simulées
//       if (process.env.NODE_ENV === 'development') {
//         return [
//           {
//             id: '1',
//             address: '123 Avenue des Champs-Élysées',
//             country: 'France',
//             city: 'Paris',
//             postalCode: '75008'
//           }
//         ];
//       }
//       throw error;
//     }
//   },

//   addCompanyLocation: async (data) => {
//     try {
//       const response = await axios.post('/api/company/locations', data);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de l\'ajout d\'un emplacement:', error);
//       throw error;
//     }
//   },

//   updateCompanyLocation: async (id, data) => {
//     try {
//       const response = await axios.put(`/api/company/locations/${id}`, data);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la mise à jour d\'un emplacement:', error);
//       throw error;
//     }
//   },

//   deleteCompanyLocation: async (id) => {
//     try {
//       const response = await axios.delete(`/api/company/locations/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Erreur lors de la suppression d\'un emplacement:', error);
//       throw error;
//     }
//   }
// };
// export const companyService = {
//   createCompany: async (companyData) => {
//     try {
//       const response = await axios.post('/companies', companyData);
//       return response.data;
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || 'Erreur lors de la création de l\'entreprise';
//       const validationErrors = error.response?.data?.errors || [];
//       throw new Error(`${errorMessage}: ${validationErrors.map(e => e.message).join(', ')}`);
//     }
//   },
//   getCompanyProfile: async () => {
//     try {
//       const response = await axios.get('/my-companies'); // Doit correspondre à /my-companies
//       console.log('Réponse de /my-companies:', response.data);
//       return response.data.data[0] || null;
//     } catch (error) {
//       console.error('Erreur lors de getCompanyProfile:', error);
//       throw error.response?.data?.message || 'Erreur lors de la récupération du profil';
//     }
//   },
//   updateCompany: async (companyId, companyData) => {
//     try {
//       const response = await axios.put(`/companies/${companyId}`, companyData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data?.message || 'Erreur lors de la mise à jour de l\'entreprise';
//     }
//   }
// };

export const companyService = {
  // Récupérer le profil de l'entreprise
  

    getCompanyProfile: async () => {
    try {
      const response = await axios.get('/companies/my-companies'); // Doit correspondre à /my-companies
      console.log('Réponse de /my-companies:', response.data);
      return response.data.data[0] || null;
    } catch (error) {
      console.error('Erreur lors de getCompanyProfile:', error);
      throw error.response?.data?.message || 'Erreur lors de la récupération du profil';
    }
  },

  

  createCompany: async (companyData) => {
        try {
          const response = await axios.post('/companies', companyData);
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Erreur lors de la création de l\'entreprise';
          const validationErrors = error.response?.data?.errors || [];
          throw new Error(`${errorMessage}: ${validationErrors.map(e => e.message).join(', ')}`);
        }},

  // Mettre à jour une entreprise
  async updateCompany(companyId, data) {
    try {
      console.log('Données envoyées au backend:', { companyId, data });
      const response = await axios.put(`/companies/${companyId}`, data);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'entreprise');
    }
  },

  // Récupérer les départements
  async getDepartments(companyId) {
    try {
      const response = await axios.get(`/companies/${companyId}/departments`);
       

      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des départements');
    }
  },

  // Créer un département
  async createDepartment(companyId, data) {
    try {
      const response = await axios.post(`/companies/${companyId}/departments`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du département');
    }
  },

  // Mettre à jour un département
  async updateDepartment(companyId, departmentId, data) {
    try {
      const response = await axios.put(`/companies/${companyId}/departments/${departmentId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du département');
    }
  },

  // Supprimer un département
  async deleteDepartment(companyId, departmentId) {
    try {
      const response = await axios.delete(`/companies/${companyId}/departments/${departmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du département');
    }
  },

  // Récupérer les emplacements
  async getCompanyLocations(companyId) {
    try {
      const response = await axios.get(`/companies/${companyId}/locations`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des emplacements');
    }
  },

  // Ajouter un emplacement
  async addCompanyLocation(companyId, data) {
    try {
      console.log('Données envoyées pour ajout d\'emplacement:', { companyId, data });
      const response = await axios.post(`/companies/${companyId}/locations`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'emplacement:', error);
      throw new Error(error.response?.data?.message || 'Validation failed');
    }
  },

  // Mettre à jour un emplacement
  async updateCompanyLocation(companyId, locationId, data) {
    try {
      const response = await axios.put(`/companies/${companyId}/locations/${locationId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'emplacement');
    }
  },

  // Supprimer un emplacement
  async deleteCompanyLocation(companyId, locationId) {
    try {
      const response = await axios.delete(`/companies/${companyId}/locations/${locationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'emplacement');
    }
  },
};

export const userService = {
  getUserIdByEmail: async (email) => {
    try {
      const response = await axios.get(`/users/email/${email}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data.id;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
      throw error;
    }
  },
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

export const cvService = {
  getCandidates: async (companyId) => {
    
    const response = await axios.get(`candidates/companies/${companyId}/candidates`, {
      
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getCandidateById: async (companyId, id) => {
    const response = await axios.get(`candidates/companies/${companyId}/candidates/${id}`, {
       
      headers: getAuthHeaders(),
    });
    console.log("response.data;",response.data);
    // console.log("response.data;",response.data);
    return { data: response.data };
  },

  createCandidate: async (companyId, candidateData) => {
    const response = await axios.post(`candidates/companies/${companyId}/candidates`, {
      
      headers: getAuthHeaders(),
      body: JSON.stringify(candidateData),
    });
    return handleResponse(response);
  },

  updateCandidate: async (companyId, id, candidateData) => {
    const response = await axios.put(`candidates/companies/${companyId}/candidates/${id}`, {
      
      headers: getAuthHeaders(),
      body: JSON.stringify(candidateData),
    });
    return handleResponse(response);
  },

  deleteCandidate: async (companyId, id) => {
    const response = await axios.delete(`candidates/companies/${companyId}/candidates/${id}`, {
      
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  downloadCV: async (id) => {
    const response = await axios.get(`candidates/candidates/${id}/download-cv`, {
       
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getCandidatesByJob: async (jobId) => {
    const response = await axios.get(`candidates/jobs/${jobId}/candidates`, {
      
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  updateCandidateStage: async (candidateId, /*stageId*/ stage) => {
    // const response = await axios.put(`candidates/candidates/${candidateId}/stage`, {
       
    //   headers: getAuthHeaders(),
    //   body: JSON.stringify({ stageId }),
    // });
    // return response.data;

    const response = await axios.put(`/candidates/candidates/${candidateId}/stage`, { stage });
    return response.data;
  },

  disqualifyCandidate: async (candidateId) => {
    const response = await axios.put(`candidates/candidates/${candidateId}/disqualify`, {
      
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

 