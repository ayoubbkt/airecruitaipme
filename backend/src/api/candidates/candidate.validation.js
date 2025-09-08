// backend/src/api/candidates/candidate.validation.js - Validations Améliorées

import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { CommentVisibility, MessagePriority } = pkg;

// Schema pour créer un candidat
export const createCandidateSchema = z.object({
  body: z.object({
    firstName: z.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'First name contains invalid characters'),
    lastName: z.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Last name contains invalid characters'),
    email: z.string()
      .email('Invalid email format')
      .max(255, 'Email must not exceed 255 characters'),
    phone: z.string()
      .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
      .optional(),
    job: z.string()
      .min(1, 'Job ID is required'),
    comment: z.string()
      .max(2000, 'Comment must not exceed 2000 characters')
      .optional(),
    linkedinUrl: z.string()
      .url('Invalid LinkedIn URL')
      .optional(),
    location: z.string()
      .max(100, 'Location must not exceed 100 characters')
      .optional()
  })
});

// Schema pour mettre à jour un candidat
export const updateCandidateSchema = z.object({
  body: z.object({
    firstName: z.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'First name contains invalid characters')
      .optional(),
    lastName: z.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Last name contains invalid characters')
      .optional(),
    email: z.string()
      .email('Invalid email format')
      .max(255, 'Email must not exceed 255 characters')
      .optional(),
    phone: z.string()
      .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
      .optional(),
    comment: z.string()
      .max(2000, 'Comment must not exceed 2000 characters')
      .optional(),
    linkedinUrl: z.string()
      .url('Invalid LinkedIn URL')
      .optional(),
    location: z.string()
      .max(100, 'Location must not exceed 100 characters')
      .optional()
  })
});

// Schema pour ajouter un commentaire

// Schema pour ajouter un commentaire
export const addCommentSchema = z.object({
  body: z.object({
    content: z.string()
      .min(1, 'Comment content is required')
      .max(10000, 'Comment must not exceed 10000 characters'),
    visibility: z.nativeEnum(CommentVisibility)
      .default('PUBLIC'),
    mentions: z.array(z.string())
      .max(20, 'Too many mentions')
      .optional()
  })
});

// Schema pour envoyer un email
export const sendEmailSchema = z.object({
  body: z.object({
    subject: z.string()
      .min(1, 'Email subject is required')
      .max(200, 'Subject must not exceed 200 characters'),
    body: z.string()
      .min(1, 'Email body is required')
      .max(50000, 'Email body must not exceed 50000 characters'),
    template: z.string()
      .max(100, 'Template name too long')
      .optional(),
    scheduledFor: z.string()
      .datetime('Invalid scheduled date format')
      .refine(date => new Date(date) > new Date(), 'Scheduled date must be in the future')
      .optional(),
    priority: z.nativeEnum(MessagePriority)
      .default('NORMAL')
      .optional(),
    attachments: z.array(z.object({
      name: z.string().max(255),
      url: z.string().url(),
      type: z.string(),
      size: z.number().max(10 * 1024 * 1024).optional()
    }))
    .max(10, 'Too many attachments')
    .optional()
  })
});

// Schema pour planifier un entretien
export const scheduleMeetingSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Meeting name is required')
      .max(200, 'Meeting name must not exceed 200 characters'),
    date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
      .refine(date => new Date(date) >= new Date().toISOString().split('T')[0], 'Meeting date cannot be in the past'),
    time: z.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    duration: z.enum([
      '15min', '30min', '45min', '1hr', 
      '1hr15min', '1hr30min', '1hr45min', '2hr'
    ], { errorMap: () => ({ message: 'Invalid duration option' }) }),
    participants: z.array(z.string())
      .min(1, 'At least one participant is required')
      .max(20, 'Too many participants'),
    location: z.string()
      .max(200, 'Location must not exceed 200 characters')
      .optional(),
    isGoogleMeet: z.boolean()
      .default(false),
    description: z.string()
      .max(2000, 'Description must not exceed 2000 characters')
      .optional(),
    reminderMinutes: z.array(z.number().min(0).max(10080))
      .max(5, 'Too many reminders')
      .optional()
  })
});

// Schema pour avancer un candidat
export const advanceCandidateSchema = z.object({
  body: z.object({
    stage: z.string()
      .min(1, 'Stage is required')
      .max(50, 'Stage name too long'),
    reason: z.string()
      .max(500, 'Reason must not exceed 500 characters')
      .optional(),
    notify: z.boolean()
      .default(true)
      .optional()
  })
});

// Schema pour disqualifier un candidat
export const disqualifyCandidateSchema = z.object({
  body: z.object({
    reason: z.string()
      .max(1000, 'Reason must not exceed 1000 characters')
      .optional(),
    sendNotification: z.boolean()
      .default(false)
      .optional(),
    template: z.string()
      .max(100, 'Template name too long')
      .optional()
  })
});

// Schema pour upload de fichier
export const uploadFileSchema = z.object({
  body: z.object({
    visibility: z.enum(['PUBLIC', 'PRIVATE', 'CONFIDENTIAL'])
      .default('PUBLIC'),
    description: z.string()
      .max(500, 'Description must not exceed 500 characters')
      .optional(),
    category: z.enum(['RESUME', 'COVER_LETTER', 'CERTIFICATE', 'PORTFOLIO', 'OTHER'])
      .default('OTHER')
      .optional()
  })
});

// Schema pour les paramètres de recherche
export const getCandidatesSchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine(val => val > 0, 'Page must be positive')
      .optional(),
    limit: z.string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional(),
    search: z.string()
      .max(100, 'Search term too long')
      .optional(),
    stage: z.string()
      .max(50, 'Stage name too long')
      .optional(),
    jobId: z.string()
      .optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'lastName', 'score'])
      .default('createdAt')
      .optional(),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc')
      .optional(),
    dateFrom: z.string()
      .datetime('Invalid date format')
      .optional(),
    dateTo: z.string()
      .datetime('Invalid date format')
      .optional()
  })
});

// Schema pour soumettre une évaluation
export const submitRatingSchema = z.object({
  body: z.object({
    overallScore: z.number()
      .min(0, 'Score must be at least 0')
      .max(5, 'Score must not exceed 5')
      .multipleOf(0.5, 'Score must be a multiple of 0.5'),
    recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'CONSIDER', 'NO_HIRE', 'STRONG_NO_HIRE'])
      .optional(),
    feedback: z.string()
      .min(10, 'Feedback must be at least 10 characters')
      .max(5000, 'Feedback must not exceed 5000 characters'),
    categories: z.array(z.object({
      name: z.string().min(1).max(100),
      score: z.number().min(0).max(5).multipleOf(0.5),
      comment: z.string().max(1000).optional()
    }))
    .max(10, 'Too many categories')
    .optional(),
    interviewType: z.enum(['PHONE_SCREEN', 'VIDEO_INTERVIEW', 'ONSITE', 'TECHNICAL', 'BEHAVIORAL'])
      .optional(),
    interviewDate: z.string()
      .datetime('Invalid interview date')
      .optional()
  })
});

// Validation des fichiers
export const validateFileUpload = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('File is required');
    return errors;
  }
  
  // Vérifier la taille (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size must not exceed 10MB');
  }
  
  // Vérifier le type de fichier
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/plain'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, TXT');
  }
  
  // Vérifier le nom du fichier
  if (file.name.length > 255) {
    errors.push('Filename too long');
  }
  
  // Vérifier les caractères dangereux dans le nom
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(file.name)) {
    errors.push('Filename contains invalid characters');
  }
  
  return errors;
};

// Validation des données d'entretien
export const validateMeetingDateTime = (date, time) => {
  const errors = [];
  
  if (!date || !time) {
    errors.push('Date and time are required');
    return errors;
  }
  
  const meetingDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  
  if (meetingDateTime <= now) {
    errors.push('Meeting cannot be scheduled in the past');
  }
  
  // Vérifier les heures ouvrables (9h-18h en semaine)
  const dayOfWeek = meetingDateTime.getDay();
  const hour = meetingDateTime.getHours();
  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend - permettre mais avertir
    errors.push('Meeting scheduled on weekend');
  }
  
  if (hour < 9 || hour >= 18) {
    errors.push('Meeting scheduled outside business hours (9AM-6PM)');
  }
  
  return errors;
};

// Validation des emails
export const validateEmailContent = (emailData) => {
  const errors = [];
  
  if (!emailData.subject?.trim()) {
    errors.push('Email subject is required');
  }
  
  if (!emailData.body?.trim()) {
    errors.push('Email body is required');
  }
  
  if (emailData.subject && emailData.subject.length > 200) {
    errors.push('Subject must be less than 200 characters');
  }
  
  if (emailData.body && emailData.body.length > 50000) {
    errors.push('Email body must be less than 50000 characters');
  }
  
  // Vérifier les liens suspects dans le corps
  const suspiciousLinks = /(?:javascript:|data:|vbscript:)/gi;
  if (suspiciousLinks.test(emailData.body)) {
    errors.push('Email contains potentially dangerous content');
  }
  
  return errors;
};

// Validation des mentions
export const validateMentions = (mentions) => {
  const errors = [];
  
  if (!Array.isArray(mentions)) {
    errors.push('Mentions must be an array');
    return errors;
  }
  
  if (mentions.length > 20) {
    errors.push('Too many mentions (max 20)');
  }
  
  // Vérifier que chaque mention est un ID valide
  mentions.forEach((mention, index) => {
    if (typeof mention !== 'string' || mention.trim().length === 0) {
      errors.push(`Invalid mention at index ${index}`);
    }
  });
  
  return errors;
};

// Validation de la visibilité des commentaires
export const validateCommentVisibility = (visibility, userRole) => {
  const allowedVisibilities = {
    'MEGA_ADMIN': ['PUBLIC', 'PRIVATE', 'CONFIDENTIAL'],
    'RECRUITING_ADMIN': ['PUBLIC', 'PRIVATE', 'CONFIDENTIAL'],
    'HIRING_MANAGER': ['PUBLIC', 'PRIVATE'],
    'REVIEWER': ['PUBLIC']
  };
  
  const userPermissions = allowedVisibilities[userRole] || ['PUBLIC'];
  
  if (!userPermissions.includes(visibility)) {
    return [`User role ${userRole} cannot set visibility to ${visibility}`];
  }
  
  return [];
};

// Validation des stages de recrutement
export const validateStageTransition = (currentStage, targetStage) => {
  const stageOrder = [
    'Leads', 'Applicants', 'Short List', 'Screening Call',
    'Interview', 'Final review', 'Offer', 'Hired'
  ];
  
  const currentIndex = stageOrder.indexOf(currentStage);
  const targetIndex = stageOrder.indexOf(targetStage);
  
  // Permettre les transitions vers l'arrière et "Disqualified" depuis n'importe où
  if (targetStage === 'Disqualified' || targetStage === 'Archived') {
    return [];
  }
  
  // Permettre les transitions normales
  if (targetIndex >= currentIndex) {
    return [];
  }
  
  // Avertir pour les transitions vers l'arrière
  if (targetIndex < currentIndex) {
    return [`Warning: Moving candidate backwards from ${currentStage} to ${targetStage}`];
  }
  
  return [`Invalid stage transition from ${currentStage} to ${targetStage}`];
};

// Validation des données de contact
export const validateContactData = (contactData) => {
  const errors = [];
  
  if (contactData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      errors.push('Invalid email format');
    }
  }
  
  if (contactData.phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(contactData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Invalid phone number format');
    }
  }
  
  if (contactData.linkedinUrl) {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/;
    if (!linkedinRegex.test(contactData.linkedinUrl)) {
      errors.push('Invalid LinkedIn URL format');
    }
  }
  
  return errors;
};

// Sanitisation du contenu
export const sanitizeHtmlContent = (content) => {
  if (!content) return content;
  
  // Supprimer les scripts et autres éléments dangereux
  const dangerousElements = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  content = content.replace(dangerousElements, '');
  
  // Supprimer les événements JavaScript
  const jsEvents = /on\w+="[^"]*"/gi;
  content = content.replace(jsEvents, '');
  
  // Supprimer les liens javascript:
  const jsLinks = /href="javascript:[^"]*"/gi;
  content = content.replace(jsLinks, 'href="#"');
  
  return content;
};

// Validation des permissions par rôle
export const getPermissionsByRole = (userRole, companyRole) => {
  const basePermissions = {
    'MEGA_ADMIN': {
      canPin: true,
      canEmail: true,
      canComment: true,
      canAdvance: true,
      canDisqualify: true,
      canUploadFiles: true,
      canDeleteFiles: true,
      canScheduleMeetings: true,
      canViewConfidential: true,
      canEditCandidate: true
    },
    'RECRUITING_ADMIN': {
      canPin: true,
      canEmail: true,
      canComment: true,
      canAdvance: true,
      canDisqualify: true,
      canUploadFiles: true,
      canDeleteFiles: true,
      canScheduleMeetings: true,
      canViewConfidential: true,
      canEditCandidate: true
    },
    'HIRING_MANAGER': {
      canPin: false,
      canEmail: true,
      canComment: true,
      canAdvance: true,
      canDisqualify: false,
      canUploadFiles: true,
      canDeleteFiles: false,
      canScheduleMeetings: true,
      canViewConfidential: false,
      canEditCandidate: false
    },
    'REVIEWER': {
      canPin: false,
      canEmail: false,
      canComment: true,
      canAdvance: false,
      canDisqualify: false,
      canUploadFiles: true,
      canDeleteFiles: false,
      canScheduleMeetings: false,
      canViewConfidential: false,
      canEditCandidate: false
    }
  };
  
  // Utiliser le rôle de l'entreprise en priorité, sinon le rôle utilisateur
  const roleToUse = companyRole || userRole;
  return basePermissions[roleToUse] || basePermissions['REVIEWER'];
};

// Validation des données de recherche
export const validateSearchParams = (searchParams) => {
  const errors = [];
  
  if (searchParams.page && (isNaN(searchParams.page) || searchParams.page < 1)) {
    errors.push('Page must be a positive number');
  }
  
  if (searchParams.limit && (isNaN(searchParams.limit) || searchParams.limit < 1 || searchParams.limit > 100)) {
    errors.push('Limit must be between 1 and 100');
  }
  
  if (searchParams.dateFrom && searchParams.dateTo) {
    const from = new Date(searchParams.dateFrom);
    const to = new Date(searchParams.dateTo);
    
    if (from > to) {
      errors.push('Date from must be before date to');
    }
  }
  
  return errors;
};