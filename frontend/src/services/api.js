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

  // Nouvelle méthode pour obtenir tous les candidats
  getCandidates: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.status) params.append('status', filters.status);
      if (filters.skills) params.append('skills', filters.skills.join(','));
      if (filters.minScore) params.append('minScore', filters.minScore);

      const response = await axios.get(`/api/candidates?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  },

  // Méthode mise à jour pour obtenir les détails d'un candidat
  getCVById: async (id) => {
    try {
      const response = await axios.get(`/api/cv/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching CV details:', error);
      throw error;
    }
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

  createJob: async (data) => {
    try {
      const response = await axios.post('/api/jobs', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'offre:', error);
      throw error;
    }
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

// export const dashboardService = {
//   getStats: async (period = '30days') => {
//     const response = await axios.get('/api/dashboard/stats', { params: { period } });
//     return response.data;
//   },
//
//   getRecentCandidates: async (limit = 5) => {
//     const response = await axios.get('/api/candidates/recent', { params: { limit } });
//     return response.data;
//   },
//
//   getRecruitmentSources: async () => {
//     const response = await axios.get('/api/dashboard/sources');
//     return response.data;
//   }
// };

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
export const workflowService = {
  getWorkflows: async () => {
    try {
      const response = await axios.get('/api/workflows');
      return response.data;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  },

  createWorkflow: async (data) => {
    try {
      const response = await axios.post('/api/workflows', data);
      return response.data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  },

  updateWorkflow: async (id, data) => {
    try {
      const response = await axios.put(`/api/workflows/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  },

  getWorkflowStages: async (workflowId) => {
    try {
      const response = await axios.get(`/api/workflows/${workflowId}/stages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow stages:', error);
      // Pour les besoins de développement, renvoyer des données simulées si le backend n'est pas encore prêt
      if (process.env.NODE_ENV === 'development') {
        return getMockStages(workflowId);
      }
      throw error;
    }
  },

  createWorkflowStage: async (workflowId, stageData) => {
    try {
      const response = await axios.post(`/api/workflows/${workflowId}/stages`, stageData);
      return response.data;
    } catch (error) {
      console.error('Error creating workflow stage:', error);
      throw error;
    }
  },

  updateWorkflowStage: async (workflowId, stageId, stageData) => {
    try {
      const response = await axios.put(`/api/workflows/${workflowId}/stages/${stageId}`, stageData);
      return response.data;
    } catch (error) {
      console.error('Error updating workflow stage:', error);
      throw error;
    }
  },

  deleteWorkflowStage: async (workflowId, stageId) => {
    try {
      const response = await axios.delete(`/api/workflows/${workflowId}/stages/${stageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting workflow stage:', error);
      throw error;
    }
  }
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
export const meetingTemplateService = {
  getMeetingTemplates: async () => {
    try {
      const response = await axios.get('/api/meeting-templates');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des templates d\'entretien:', error);
      // Pour le développement, retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        return getMockMeetingTemplates();
      }
      throw error;
    }
  },

  getMeetingTemplateById: async (id) => {
    try {
      const response = await axios.get(`/api/meeting-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du chargement du template d'entretien ${id}:`, error);
      throw error;
    }
  },

  createMeetingTemplate: async (data) => {
    try {
      const response = await axios.post('/api/meeting-templates', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du template d\'entretien:', error);
      throw error;
    }
  },

  updateMeetingTemplate: async (id, data) => {
    try {
      const response = await axios.put(`/api/meeting-templates/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du template d'entretien ${id}:`, error);
      throw error;
    }
  },

  deleteMeetingTemplate: async (id) => {
    try {
      const response = await axios.delete(`/api/meeting-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du template d'entretien ${id}:`, error);
      throw error;
    }
  }
};



// Service de templates de messages
export const messageTemplateService = {
  getMessageTemplates: async () => {
    try {
      const response = await axios.get('/api/message-templates');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des templates de messages:', error);
      // Pour le développement, retourner des données fictives si le backend n'est pas prêt
      if (process.env.NODE_ENV === 'development') {
        return getMockMessageTemplates();
      }
      throw error;
    }
  },

  getMessageTemplateById: async (id) => {
    try {
      const response = await axios.get(`/api/message-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du template ${id}:`, error);
      throw error;
    }
  },

  createMessageTemplate: async (templateData) => {
    try {
      const response = await axios.post('/api/message-templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      throw error;
    }
  },

  updateMessageTemplate: async (id, templateData) => {
    try {
      const response = await axios.put(`/api/message-templates/${id}`, templateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du template ${id}:`, error);
      throw error;
    }
  },

  deleteMessageTemplate: async (id) => {
    try {
      const response = await axios.delete(`/api/message-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du template ${id}:`, error);
      throw error;
    }
  }
};

// Données fictives pour le développement
function getMockMessageTemplates() {
  return {
    required: [
      {
        id: 'template-1',
        name: 'Confirmation de Candidature',
        subject: 'Merci pour votre candidature !',
        description: 'Email par défaut envoyé aux nouveaux candidats comme confirmation.',
        content: `Bonjour {{candidat.prenom}},\n\nMerci d'avoir postulé à notre poste de {{poste.titre}}! Nous sommes ravis de votre intérêt et apprécions le temps que vous avez consacré à cette démarche.\n\nNotre équipe examine actuellement les candidatures et nous vous contacterons prochainement pour vous informer des prochaines étapes. Si votre profil correspond à nos besoins, nous vous proposerons un entretien.\n\nN'hésitez pas à me contacter si vous avez des questions.\n\nCordialement,\n{{recruteur.nom}}`
      },
      {
        id: 'template-2',
        name: 'Email de Disqualification',
        subject: 'Concernant votre candidature',
        description: 'Email par défaut envoyé quand un candidat est disqualifié.',
        content: `Bonjour {{candidat.prenom}},\n\nNous vous remercions d'avoir postulé pour le poste de {{poste.titre}}.\n\nAprès examen attentif de votre candidature, nous regrettons de vous informer que nous avons décidé de poursuivre avec d'autres candidats dont les profils correspondent davantage aux critères que nous recherchons pour ce poste.\n\nNous apprécions votre intérêt pour notre entreprise et vous souhaitons plein succès dans vos recherches professionnelles.\n\nCordialement,\n{{recruteur.nom}}`
      }
    ],
    custom: [
      {
        id: 'template-3',
        name: 'Appel Téléphonique',
        subject: 'Planification d\'un entretien téléphonique',
        content: `Bonjour {{candidat.prenom}},\n\nSuite à l'examen de votre candidature pour le poste de {{poste.titre}}, nous aimerions vous inviter à un entretien téléphonique afin de discuter plus en détail de votre profil.\n\nPourriez-vous me communiquer vos disponibilités pour la semaine prochaine ?\n\nÀ bientôt,\n{{recruteur.nom}}`
      },
      {
        id: 'template-4',
        name: 'Appel Téléphonique (Auto-planification)',
        subject: 'Planifiez votre entretien téléphonique',
        content: `Bonjour {{candidat.prenom}},\n\nNous souhaitons vous inviter à un entretien téléphonique pour le poste de {{poste.titre}}.\n\nVous pouvez planifier cet entretien directement via le lien suivant selon vos disponibilités : {{lien_planification}}\n\nNous sommes impatients d'échanger avec vous.\n\nCordialement,\n{{recruteur.nom}}`
      },
      {
        id: 'template-5',
        name: 'Entretien (Auto-planification)',
        subject: 'Planifiez votre entretien',
        content: `Bonjour {{candidat.prenom}},\n\nNous sommes heureux de vous inviter à un entretien pour le poste de {{poste.titre}}.\n\nVeuillez utiliser le lien suivant pour planifier votre entretien selon vos disponibilités : {{lien_planification}}\n\nL'entretien se déroulera à notre bureau situé à {{entreprise.adresse}} et durera environ 1 heure.\n\nN'hésitez pas à me contacter si vous avez des questions.\n\nCordialement,\n{{recruteur.nom}}`
      },
      {
        id: 'template-6',
        name: 'Entretien',
        subject: 'Invitation à un entretien',
        content: `Bonjour {{candidat.prenom}},\n\nNous sommes ravis de vous inviter à un entretien pour le poste de {{poste.titre}}.\n\nSeriez-vous disponible aux dates suivantes :\n- Jeudi 25 mars à 14h\n- Vendredi 26 mars à 10h\n- Lundi 29 mars à 15h\n\nMerci de me faire part de vos préférences, et nous confirmerons l'horaire définitif.\n\nL'entretien se déroulera à notre siège social et durera environ 1 heure.\n\nCordialement,\n{{recruteur.nom}}`
      },
      {
        id: 'template-7',
        name: 'Envoi d\'Offre',
        subject: 'Offre d\'emploi - {{poste.titre}}',
        content: `Bonjour {{candidat.prenom}},\n\nSuite à notre processus de recrutement, nous sommes heureux de vous proposer un poste de {{poste.titre}} au sein de notre entreprise.\n\nVous trouverez ci-joint votre lettre d'offre détaillant les conditions de votre emploi, la rémunération, et les avantages sociaux associés.\n\nNous vous prions de bien vouloir nous indiquer votre décision d'ici le {{date_limite_reponse}}.\n\nEn cas d'acceptation, nous organiserons votre intégration et vous communiquerons toutes les informations nécessaires.\n\nNous restons à votre disposition pour répondre à vos questions.\n\nCordialement,\n{{recruteur.nom}}`
      }
    ]
  };
}


// Service de questions
export const questionService = {
  getCustomQuestions: async () => {
    try {
      const response = await axios.get('/api/questions/custom');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des questions personnalisées:', error);
      // Pour les besoins de développement, renvoyer des données simulées si le backend n'est pas encore prêt
      if (process.env.NODE_ENV === 'development') {
        return getMockQuestions();
      }
      throw error;
    }
  },

  getQuestionSets: async () => {
    try {
      const response = await axios.get('/api/questions/sets');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des ensembles de questions:', error);
      // Pour les besoins de développement, renvoyer des données simulées si le backend n'est pas encore prêt
      if (process.env.NODE_ENV === 'development') {
        return [];
      }
      throw error;
    }
  },

  createQuestion: async (questionData) => {
    try {
      const response = await axios.post('/api/questions', questionData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la question:', error);
      throw error;
    }
  },

  updateQuestion: async (id, questionData) => {
    try {
      const response = await axios.put(`/api/questions/${id}`, questionData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la question:', error);
      throw error;
    }
  },

  deleteQuestion: async (id) => {
    try {
      const response = await axios.delete(`/api/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la question:', error);
      throw error;
    }
  },

  createQuestionSet: async (setData) => {
    try {
      const response = await axios.post('/api/questions/sets', setData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'ensemble de questions:', error);
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
  getRatingCards: async () => {
    try {
      const response = await axios.get('/api/rating-cards');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des fiches d\'évaluation:', error);
      // Pour le développement, retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        return getMockRatingCards();
      }
      throw error;
    }
  },

  // Autres méthodes selon besoin...
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
export const companyService = {
  createCompany: async (companyData) => {
    try {
      const response = await axios.post('/companies', companyData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création de l\'entreprise';
      const validationErrors = error.response?.data?.errors || [];
      throw new Error(`${errorMessage}: ${validationErrors.map(e => e.message).join(', ')}`);
    }
  },
  getCompanyProfile: async () => {
    try {
      const response = await axios.get('/my-companies'); // Doit correspondre à /api/v1/my-companies
      console.log('Réponse de /my-companies:', response.data);
      return response.data.data[0] || null;
    } catch (error) {
      console.error('Erreur lors de getCompanyProfile:', error);
      throw error.response?.data?.message || 'Erreur lors de la récupération du profil';
    }
  },
  updateCompany: async (companyId, companyData) => {
    try {
      const response = await axios.put(`/companies/${companyId}`, companyData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Erreur lors de la mise à jour de l\'entreprise';
    }
  }
};