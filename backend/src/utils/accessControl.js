// backend/src/utils/accessControl.js
import prisma from '../config/db.js';

/**
 * Utilitaires de contrôle d'accès et de permissions
 * Gère les vérifications de sécurité pour les entreprises et rôles
 */

// Énumération des rôles avec leurs niveaux de permission
const ROLE_HIERARCHY = {
  ADMIN: 100,
  HIRING_MANAGER: 80,
  RECRUITER: 60,
  HR_SPECIALIST: 40,
  VIEWER: 20,
  GUEST: 10
};

// Permissions par rôle
const ROLE_PERMISSIONS = {
  ADMIN: [
    'manage_users',
    'manage_company_settings',
    'view_all_candidates',
    'manage_workflows',
    'access_reports',
    'manage_integrations',
    'delete_sensitive_data'
  ],
  HIRING_MANAGER: [
    'view_all_candidates',
    'manage_candidates',
    'schedule_interviews',
    'send_emails',
    'access_reports',
    'manage_job_workflows'
  ],
  RECRUITER: [
    'view_assigned_candidates',
    'manage_assigned_candidates',
    'schedule_interviews',
    'send_emails',
    'upload_files'
  ],
  HR_SPECIALIST: [
    'view_assigned_candidates',
    'schedule_interviews',
    'send_emails',
    'view_basic_reports'
  ],
  VIEWER: [
    'view_assigned_candidates',
    'view_basic_reports'
  ],
  GUEST: [
    'view_limited_info'
  ]
};

/**
 * Vérifier l'accès à une entreprise
 */
export const checkCompanyAccess = async (userId, companyId, requiredRole = null) => {
  try {
    if (!userId || !companyId) {
      const error = new Error('UserId et CompanyId requis');
      error.statusCode = 400;
      throw error;
    }

    // Récupérer le membership de l'utilisateur dans l'entreprise
    const membership = await prisma.companyMember.findFirst({
      where: {
        userId,
        companyId
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!membership) {
      const error = new Error('Accès non autorisé à cette entreprise');
      error.statusCode = 403;
      throw error;
    }

    // Vérifier le rôle requis si spécifié
    if (requiredRole) {
      const hasRequiredRole = checkRoleHierarchy(membership.role, requiredRole);
      if (!hasRequiredRole) {
        const error = new Error(`Rôle ${requiredRole} requis`);
        error.statusCode = 403;
        throw error;
      }
    }

    return membership;

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Erreur vérification accès entreprise:', error);
    const accessError = new Error('Erreur de vérification d\'accès');
    accessError.statusCode = 500;
    throw accessError;
  }
};

/**
 * Vérifier les permissions administrateur d'entreprise
 */
export const checkCompanyAdminAccess = async (userId, companyId) => {
  return checkCompanyAccess(userId, companyId, 'ADMIN');
};

/**
 * Vérifier les permissions de hiring manager
 */
export const checkHiringManagerAccess = async (userId, companyId) => {
  return checkCompanyAccess(userId, companyId, 'HIRING_MANAGER');
};

/**
 * Vérifier si un utilisateur peut accéder à un candidat
 */
export const checkCandidateAccess = async (userId, companyId, candidateId, action = 'view') => {
  try {
    // Vérifier l'accès à l'entreprise
    const membership = await checkCompanyAccess(userId, companyId);

    // Récupérer le candidat avec ses assignations
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        companyId
      },
      include: {
        assignedUsers: {
          select: { userId: true }
        },
        jobOffer: {
          include: {
            assignedUsers: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!candidate) {
      const error = new Error('Candidat non trouvé');
      error.statusCode = 404;
      throw error;
    }

    // Les admins et hiring managers peuvent tout voir
    if (['ADMIN', 'HIRING_MANAGER'].includes(membership.role)) {
      return { candidate, membership };
    }

    // Vérifier si l'utilisateur est assigné au candidat ou au job
    const isAssignedToCandidate = candidate.assignedUsers.some(
      assignedUser => assignedUser.userId === userId
    );
    
    const isAssignedToJob = candidate.jobOffer?.assignedUsers?.some(
      assignedUser => assignedUser.userId === userId
    );

    if (!isAssignedToCandidate && !isAssignedToJob) {
      const error = new Error('Accès non autorisé à ce candidat');
      error.statusCode = 403;
      throw error;
    }

    // Vérifier les permissions pour l'action demandée
    const canPerformAction = checkActionPermission(membership.role, action);
    if (!canPerformAction) {
      const error = new Error(`Action '${action}' non autorisée pour votre rôle`);
      error.statusCode = 403;
      throw error;
    }

    return { candidate, membership };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Erreur vérification accès candidat:', error);
    const accessError = new Error('Erreur de vérification d\'accès au candidat');
    accessError.statusCode = 500;
    throw accessError;
  }
};

/**
 * Vérifier la hiérarchie des rôles
 */
export const checkRoleHierarchy = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * Vérifier les permissions pour une action
 */
export const checkActionPermission = (userRole, action) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  
  const actionPermissionMap = {
    'view': ['view_assigned_candidates', 'view_all_candidates'],
    'edit': ['manage_assigned_candidates', 'manage_candidates'],
    'delete': ['manage_candidates', 'delete_sensitive_data'],
    'schedule_interview': ['schedule_interviews'],
    'send_email': ['send_emails'],
    'manage_workflow': ['manage_workflows', 'manage_job_workflows'],
    'access_reports': ['access_reports', 'view_basic_reports'],
    'upload_files': ['upload_files', 'manage_candidates'],
    'manage_users': ['manage_users'],
    'manage_settings': ['manage_company_settings']
  };

  const requiredPermissions = actionPermissionMap[action] || [action];
  
  return requiredPermissions.some(permission => 
    rolePermissions.includes(permission)
  );
};

/**
 * Vérifier l'accès à un fichier candidat selon sa visibilité
 */
export const checkFileAccess = async (userId, companyId, file) => {
  try {
    const membership = await checkCompanyAccess(userId, companyId);
    
    switch (file.visibility) {
      case 'Public':
        // Tous les membres de l'entreprise peuvent voir
        return true;
        
      case 'Private':
        // Seuls les admins et hiring managers peuvent voir
        return ['ADMIN', 'HIRING_MANAGER'].includes(membership.role);
        
      case 'Confidential':
        // Seuls l'auteur et les admins peuvent voir
        return file.uploadedById === userId || membership.role === 'ADMIN';
        
      default:
        return false;
    }
    
  } catch (error) {
    console.error('Erreur vérification accès fichier:', error);
    return false;
  }
};

/**
 * Vérifier l'accès à un commentaire selon sa visibilité
 */
export const checkCommentAccess = async (userId, companyId, comment) => {
  try {
    const membership = await checkCompanyAccess(userId, companyId);
    
    switch (comment.visibility) {
      case 'Public':
        // Tous les membres de l'entreprise peuvent voir
        return true;
        
      case 'Private':
        // Seuls les admins et hiring managers peuvent voir
        return ['ADMIN', 'HIRING_MANAGER'].includes(membership.role);
        
      case 'Confidential':
        // Seuls l'auteur et les admins peuvent voir
        return comment.authorId === userId || membership.role === 'ADMIN';
        
      default:
        return false;
    }
    
  } catch (error) {
    console.error('Erreur vérification accès commentaire:', error);
    return false;
  }
};

/**
 * Filtrer une liste d'éléments selon les permissions
 */
export const filterByPermissions = async (userId, companyId, items, getVisibilityFn) => {
  try {
    const membership = await checkCompanyAccess(userId, companyId);
    
    return items.filter(item => {
      const visibility = getVisibilityFn(item);
      
      switch (visibility) {
        case 'Public':
          return true;
        case 'Private':
          return ['ADMIN', 'HIRING_MANAGER'].includes(membership.role);
        case 'Confidential':
          return item.authorId === userId || item.uploadedById === userId || membership.role === 'ADMIN';
        default:
          return false;
      }
    });
    
  } catch (error) {
    console.error('Erreur filtrage permissions:', error);
    return [];
  }
};

/**
 * Middleware Express pour vérifier l'accès à une entreprise
 */
export const requireCompanyAccess = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const companyId = req.params.companyId || req.body.companyId;
      
      if (!userId || !companyId) {
        return res.status(400).json({
          success: false,
          message: 'UserId et CompanyId requis'
        });
      }
      
      const membership = await checkCompanyAccess(userId, companyId, requiredRole);
      req.companyMembership = membership;
      
      next();
      
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  };
};

/**
 * Middleware Express pour vérifier l'accès admin
 */
export const requireAdminAccess = requireCompanyAccess('ADMIN');

/**
 * Middleware Express pour vérifier l'accès hiring manager
 */
export const requireHiringManagerAccess = requireCompanyAccess('HIRING_MANAGER');

/**
 * Obtenir les permissions d'un utilisateur
 */
export const getUserPermissions = async (userId, companyId) => {
  try {
    const membership = await checkCompanyAccess(userId, companyId);
    const permissions = ROLE_PERMISSIONS[membership.role] || [];
    
    return {
      role: membership.role,
      permissions,
      level: ROLE_HIERARCHY[membership.role] || 0
    };
    
  } catch (error) {
    return {
      role: null,
      permissions: [],
      level: 0
    };
  }
};

export default {
  checkCompanyAccess,
  checkCompanyAdminAccess,
  checkHiringManagerAccess,
  checkCandidateAccess,
  checkRoleHierarchy,
  checkActionPermission,
  checkFileAccess,
  checkCommentAccess,
  filterByPermissions,
  requireCompanyAccess,
  requireAdminAccess,
  requireHiringManagerAccess,
  getUserPermissions
};