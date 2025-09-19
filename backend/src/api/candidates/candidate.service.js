// backend/src/api/candidates/candidate.service.js - Version étendue

import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
import fs from 'fs/promises';
import path from 'path';
import emailService from '../../utils/emailService.js';
import { createMeetingInvitation, formatDateTime } from '../../utils/calendarService.js';
import icalGenerator from '../../utils/icalGenerator.js';
import config from '../../config/index.js';


const { UserRole, CompanyMemberRole, CommentVisibility, ActivityType, MessageType, MessageStatus } = pkg;


// Helper existant
async function checkCandidatePermission(userId, companyId) {
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });

  if (!membership || !['RECRUITING_ADMIN', 'HIRING_MANAGER', 'REVIEWER'].includes(membership.role)) {
    const platformUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!platformUser || platformUser.role !== 'MEGA_ADMIN') {
      const error = new Error('Forbidden: You do not have sufficient permissions within this company.');
      error.statusCode = 403;
      throw error;
    }
  }
  return true;
}

class CandidateService {
  // Fonctions existantes améliorées
  async getCandidates(userId, companyId, queryParams = {}) {
    await checkCandidatePermission(userId, companyId);

    const { 
      page = 1,  
      stage, 
      jobId, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;
    // Coerce pagination to integers (req.query provides strings)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = queryParams.limit ? parseInt(queryParams.limit, 10) : undefined;
const skip = limitNum ? (pageNum - 1) * limitNum : undefined;
    const whereClause = {
      applications: {
        some: {
          job: { companyId }
        }
      }
    };

    // Filtres
    if (stage) {
      whereClause.applications.some.currentStageId = stage;
    }
    if (jobId) {
      whereClause.applications.some.jobId = jobId;
    }
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where: whereClause,
       ...(skip !== undefined ? { skip } : {}),
  ...(limitNum !== undefined ? { take: limitNum } : {}),
      orderBy: { [sortBy]: sortOrder },
      include: {
        applications: {
          include: {
            job: { select: { id: true, title: true } },
            currentStage: { select: { id: true, name: true, type: true } }
          }
        },
        _count: {
          select: {
            comments: true,
            files: true,
            ratings: true
          }
        }
      }
    });

    const totalCandidates = await prisma.candidate.count({ where: whereClause });

    return {
      data: candidates.map(candidate => ({
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        resumeUrl: candidate.resumeUrl,
        comment: candidate.comment,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
        score: candidate.score || 85, // Score par défaut pour l'affichage
        applications: candidate.applications.map(app => ({
          id: app.id,
          jobId: app.jobId,
          jobTitle: app.job.title,
          status: app.status,
          currentStage: app.currentStage
        })),
        counts: candidate._count
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCandidates / limitNum),
        totalCount: totalCandidates,
        hasNext: pageNum < Math.ceil(totalCandidates / limitNum),
        hasPrev: pageNum > 1
      }
    };
  }

  // Amélioration de getCandidateById pour inclure toutes les relations
  async getCandidateById(userId, companyId, id) {
    await checkCandidatePermission(userId, companyId);

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                companyId: true,
                hiringTeam: {
                  include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } }
                  }
                }
              }
            },
            currentStage: { select: { id: true, name: true, type: true } }
          }
        },
        comments: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        files: {
          include: {
            uploader: { select: { id: true, firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          include: {
            performer: { select: { id: true, firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!candidate || !candidate.applications.some(app => app.job.companyId === companyId)) {
      const error = new Error('Candidate not found or access denied.');
      error.statusCode = 404;
      throw error;
    }
    
    // Extraire le contenu du CV
    const resumeContent = await this.extractResumeContent(candidate.resumeUrl);

    return {
      ...candidate,
      resumeContent,
      score: candidate.score || 85,
      applications: candidate.applications.map(app => ({
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.job.title,
        status: app.status,
        currentStage: app.currentStage,
        hiringTeam: app.job.hiringTeam
      }))
    };
  }

  // Nouvelles fonctions
  async getCandidatesByStage(userId, companyId, stageId) {
    await checkCandidatePermission(userId, companyId);

    const candidates = await prisma.candidate.findMany({
      where: {
        applications: {
          some: {
            currentStageId: stageId,
            job: { companyId }
          }
        }
      },
      include: {
        applications: {
          where: { 
            currentStageId: stageId,
            job: { companyId }
          },
          include: {
            job: { select: { id: true, title: true } },
            currentStage: { select: { id: true, name: true } }
          }
        }
      },
  orderBy: { updatedAt: 'desc' }
    });

    return candidates.map(candidate => ({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phoneNumber: candidate.phoneNumber,
      score: candidate.score || 85,
      stageEnteredAt: candidate.applications[0]?.updatedAt,
      application: candidate.applications[0]
    }));
  }

  // async moveCandidateToStage(userId, companyId, candidateId, stageId, comment = null) {
  //   await checkCandidatePermission(userId, companyId);

  //   const application = await prisma.application.findFirst({
  //     where: {
  //       candidateId,
  //       job: { companyId },
  //     },
  //     include: {
  //       candidate: true,
  //       job: {
  //         include: {
  //           jobWorkflow: true,
  //         },
  //       },
  //       currentStage: true,
  //     },
  //   });

  //   if (!application) {
  //     const error = new Error('Application not found.');
  //     error.statusCode = 404;
  //     throw error;
  //   }

  //   // Check if job workflow exists, if not create one
  //   let jobWorkflow = application.job.jobWorkflow;
    
  //   if (!jobWorkflow) {
  //     console.log('Creating job workflow for job:', application.job.id);
  //     jobWorkflow = await prisma.jobWorkflow.create({
  //       data: {
  //         jobId: application.job.id,
  //         name: `Workflow for ${application.job.title || 'Untitled Job'}`,
  //       }
  //     });
  //   }
    
  //   console.log('moveCandidateToStage - stageId: ', stageId);
  //   const isNumericOrder = typeof stageId === 'number' || (/^\d+$/.test(String(stageId)));
  //   let newStage = null;

  //   if (isNumericOrder) {
  //     // Legacy path: stageId represents an order index
  //     newStage = await prisma.jobWorkflowStage.findFirst({
  //       where: {
  //         jobWorkflowId: jobWorkflow.id,
  //         order: Number(stageId),
  //       },
  //     });

  //     // If stage doesn't exist, check if any stages exist or create default stages
  //     if (!newStage) {
  //       console.log('Stage (by order) not found, checking for existing stages');

  //       const existingStages = await prisma.jobWorkflowStage.findMany({
  //         where: { jobWorkflowId: jobWorkflow.id }
  //       });

  //       if (existingStages.length === 0) {
  //         console.log('No stages found, creating default stages');
  //         const defaultStages = [
  //           { name: 'Initial Review', type: 'AI_SCREENING', order: 0 },
  //           { name: 'Phone Screen', type: 'INTERVIEW', order: 1 },
  //           { name: 'Interview', type: 'INTERVIEW', order: 2 },
  //           { name: 'Offer', type: 'OFFER', order: 3 },
  //           { name: 'Hired', type: 'HIRED', order: 4 }
  //         ];
  //         for (const stage of defaultStages) {
  //           try {
  //             await prisma.jobWorkflowStage.create({
  //               data: { jobWorkflowId: jobWorkflow.id, name: stage.name, type: stage.type, order: stage.order }
  //             });
  //           } catch (error) {
  //             console.log(`Error creating stage with order ${stage.order}:`, error.message);
  //           }
  //         }
  //       } else {
  //         console.log('Found existing stages, not creating defaults');
  //         // Ensure any missing default orders exist (legacy safety)
  //         const defaultStages = [
  //           { name: 'Initial Review', type: 'AI_SCREENING', order: 0 },
  //           { name: 'Phone Screen', type: 'INTERVIEW', order: 1 },
  //           { name: 'Interview', type: 'INTERVIEW', order: 2 },
  //           { name: 'Offer', type: 'OFFER', order: 3 },
  //           { name: 'Hired', type: 'HIRED', order: 4 }
  //         ];
  //         const existingOrders = new Set(existingStages.map(s => s.order));
  //         for (const stage of defaultStages) {
  //           if (!existingOrders.has(stage.order)) {
  //             try {
  //               console.log(`Creating missing stage order=${stage.order} name=${stage.name}`);
  //               await prisma.jobWorkflowStage.create({
  //                 data: { jobWorkflowId: jobWorkflow.id, name: stage.name, type: stage.type, order: stage.order }
  //               });
  //             } catch (err) {
  //               console.log(`Skipped creating missing stage order ${stage.order}:`, err.message);
  //             }
  //           }
  //         }
  //       }

  //       // Try to find the requested stage again by order
  //       newStage = await prisma.jobWorkflowStage.findFirst({
  //         where: { jobWorkflowId: jobWorkflow.id, order: Number(stageId) },
  //       });

  //       // Final fallback: pick closest by order
  //       if (!newStage) {
  //         const allStages = await prisma.jobWorkflowStage.findMany({
  //           where: { jobWorkflowId: jobWorkflow.id },
  //           orderBy: { order: 'asc' },
  //         });
  //         if (allStages.length > 0) {
  //           if (Number(stageId) >= allStages.length) newStage = allStages[allStages.length - 1];
  //           else newStage = allStages[Math.min(Number(stageId), allStages.length - 1)];
  //           console.log(`Using stage with order ${newStage.order} as fallback`);
  //         }
  //       }
  //     }
  //   } else {
  //     // Preferred path: stageId is the actual stage row id (UUID/ID)
  //     newStage = await prisma.jobWorkflowStage.findFirst({
  //       where: {
  //         id: String(stageId),
  //         jobWorkflowId: jobWorkflow.id,
  //       },
  //     });

  //     if (!newStage) {
  //       const error = new Error('Stage not found for given stageId');
  //       error.statusCode = 404;
  //       throw error;
  //     }
  //   }
    
  //   if (!newStage) {
  //     const error = new Error('No workflow stages found for this job.');
  //     error.statusCode = 404;
  //     throw error;
  //   }

  //   const result = await prisma.$transaction(async (tx) => {
  //     // Mettre à jour l'application
  //     const updatedApplication = await tx.application.update({
  //       where: { id: application.id },
  //       data: {
  //         currentStageId: newStage.id,
  //         updatedAt: new Date(),
  //       },
  //     });

  //     // Créer une activité
  //     await tx.activity.create({
  //       data: {
  //         candidateId,
  //         type: 'STAGE_CHANGE',
  //         description: `Moved from ${application.currentStage?.name || 'Unknown'} to ${newStage.name}`,
  //         performedBy: userId,
  //         metadata: {
  //           fromStageId: application.currentStageId,
  //           fromStageName: application.currentStage?.name,
  //           toStageId: newStage.id,
  //           toStageName: newStage.name,
  //           comment,
  //         },
  //       },
  //     });

  //     // Ajouter un commentaire si fourni
  //     if (comment) {
  //       await tx.comment.create({
  //         data: {
  //           candidateId,
  //           content: comment,
  //           authorId: userId,
  //           visibility: 'PUBLIC'
  //         }
  //       });
  //     }

  //     return updatedApplication;
  //   });

  //   return { message: 'Candidate moved successfully', data: result };
  // }
// Dans backend/src/api/candidates/candidate.service.js
// Fonction moveCandidateToStage améliorée avec logs de débogage

async moveCandidateToStage(userId, companyId, candidateId, stageId, comment = '') {
  console.log(`Démarrage moveCandidateToStage: candidat=${candidateId}, étape=${stageId}`);
  await checkCandidatePermission(userId, companyId);

  // Trouver le candidat et vérifier qu'il existe et appartient à cette entreprise
  const candidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      applications: { some: { job: { companyId } } }
    },
    include: {
      applications: {
        take: 1,
        include: {
          job: {
            select: { 
              id: true, 
              title: true, 
              companyId: true
            }
          },
          currentStage: true
        }
      }
    }
  });

  if (!candidate) {
    const error = new Error('Candidate not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  console.log(`Candidat trouvé: ${candidate.firstName} ${candidate.lastName}, email: ${candidate.email}`);

  // Vérifier que l'application existe
  const application = candidate.applications[0];
  if (!application) {
    const error = new Error('No application found for this candidate.');
    error.statusCode = 404;
    throw error;
  }

  // Obtenir les détails du Job
  const jobId = application.job.id;
  console.log(`Job ID: ${jobId}`);

  // Récupérer le workflow et ses étapes
  const jobWorkflow = await prisma.jobWorkflow.findUnique({
    where: { jobId: jobId },
    include: {
      stages: true
    }
  });

  if (!jobWorkflow) {
    const error = new Error('No workflow found for this job.');
    error.statusCode = 404;
    throw error;
  }

  console.log(`Workflow trouvé: ${jobWorkflow.id}, nombre d'étapes: ${jobWorkflow.stages.length}`);

  // Vérifier que l'étape cible existe dans le workflow
  let targetStage;
  
  // Si 'disqualified' ou 'archived' sont passés directement
  if (stageId === 'disqualified' || stageId === 'DISQUALIFIED') {
    targetStage = jobWorkflow.stages.find(s => 
      s.type === 'DISQUALIFIED' || 
      s.name.toLowerCase() === 'disqualified'
    );
  } else if (stageId === 'archived' || stageId === 'ARCHIVED') {
    targetStage = jobWorkflow.stages.find(s => 
      s.type === 'ARCHIVED' || 
      s.name.toLowerCase() === 'archived'
    );
  } else {
    // Chercher par ID
    targetStage = jobWorkflow.stages.find(s => s.id === stageId);
  }

  if (!targetStage) {
    const error = new Error(`Stage not found: ${stageId}`);
    error.statusCode = 404;
    throw error;
  }

  console.log(`Étape cible trouvée: ${targetStage.name}, type: ${targetStage.type}`);

  // Obtenir l'étape actuelle pour logging et notifications
  const currentStage = application.currentStage;
  const currentStageName = currentStage?.name || 'Unknown';
  const targetStageName = targetStage.name;

  // Mettre à jour l'application avec la nouvelle étape
  const updatedApplication = await prisma.application.update({
    where: { id: application.id },
    data: {
      currentStageId: targetStage.id,
      updatedAt: new Date()
    }
  });

  console.log(`Application mise à jour: étape changée de ${currentStageName} à ${targetStageName}`);

  // Créer une activité pour suivre le changement d'étape
  await prisma.activity.create({
    data: {
      candidateId,
      type: 'STAGE_CHANGE',
      description: `Stage changed from ${currentStageName} to ${targetStageName}`,
      performedBy: userId,
      metadata: {
        fromStage: currentStage?.id || null,
        toStage: targetStage.id,
        comment: comment || ''
      }
    }
  });

  // Ajouter un commentaire si fourni
  if (comment) {
    await prisma.comment.create({
      data: {
        candidateId,
        content: comment,
        authorId: userId,
        visibility: 'PUBLIC'
      }
    });
  }

  // ====== FONCTIONNALITÉ : ENVOYER UNE INVITATION DE RÉUNION AUTOMATIQUE SI CONFIGURÉE ======
  try {
    console.log(`Vérification si réunion automatique pour l'étape: ${targetStage.id}`);
    
    // Vérifier directement les settings depuis targetStage
    let stageSettings = targetStage.settings;
    let meetingTemplateId = null;
    
    // Si settings n'est pas disponible directement, récupérer les paramètres de l'étape cible
    if (!stageSettings || typeof stageSettings !== 'object') {
      console.log("Settings non disponibles directement, récupération séparée...");
      const targetStageDetail = await prisma.jobWorkflowStage.findUnique({
        where: { id: targetStage.id },
        select: { settings: true, type: true }
      });
      
      if (targetStageDetail && targetStageDetail.settings) {
        stageSettings = targetStageDetail.settings;
        console.log(`Settings récupérés: ${JSON.stringify(stageSettings)}`);
      }
    }
    
    // Vérifier si settings est au format JSON string et le parser si nécessaire
    if (typeof stageSettings === 'string') {
      try {
        stageSettings = JSON.parse(stageSettings);
        console.log("Settings parsés depuis JSON string");
      } catch (e) {
        console.error("Erreur parsing JSON settings:", e);
      }
    }
    
    // Vérifier si l'étape a un template de réunion configuré
    if (stageSettings && typeof stageSettings === 'object') {
      meetingTemplateId = stageSettings.meetingTemplateId;
      console.log(`Template de réunion trouvé: ${meetingTemplateId}`);
    }
    
    // Vérifier si l'étape est de type INTERVIEW et a un template de réunion configuré
    const isInterviewStage = targetStage.type === 'INTERVIEW' || 
                             targetStage.type === 'PHONE_SCREEN' || 
                             String(targetStage.type || '').toLowerCase().includes('interview');
    
    if (isInterviewStage && meetingTemplateId) {
      console.log(`Étape ${targetStageName} est de type entretien et a un template de réunion: ${meetingTemplateId}`);
      
      // Récupérer le template de réunion
      const meetingTemplate = await prisma.meetingTemplate.findUnique({
        where: {
          id: meetingTemplateId
        }
      });

      if (meetingTemplate) {
        console.log(`Template de réunion trouvé: ${meetingTemplate.name || meetingTemplate.title}`);
        
        // Récupérer les informations de l'organisateur (l'utilisateur actuel)
        const organizer = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, firstName: true, lastName: true }
        });

        console.log(`Organisateur: ${organizer.firstName} ${organizer.lastName}`);

        // Calculer les dates de début et de fin
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + 2); // Par défaut à dans 2 jours
        startTime.setHours(10, 0, 0, 0); // 10h00 du matin
        
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + (meetingTemplate.duration || 60)); // Durée du template ou 60 min par défaut

        console.log(`Date/heure de réunion: ${startTime.toISOString()} - ${endTime.toISOString()}`);

        // Préparer les participants (organisateur + candidat + participants configurés dans l'étape)
        const attendees = [];
        
        // Ajouter les participants configurés dans l'étape si disponibles
        if (stageSettings.attendees && Array.isArray(stageSettings.attendees)) {
          console.log(`Ajout de ${stageSettings.attendees.length} participants configurés`);
          attendees.push(...stageSettings.attendees);
        }
        
        // Créer les données de réunion
        const meetingData = {
          title: meetingTemplate.title || `Entretien avec ${candidate.firstName} ${candidate.lastName}`,
          description: meetingTemplate.description || '',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: 'Google Meet', // Par défaut
          isGoogleMeet: true,
          attendees
        };

        console.log(`Planification de réunion avec données: ${JSON.stringify(meetingData)}`);

        // Appeler scheduleMeeting pour créer la réunion
        const meetingResult = await this.scheduleMeeting(userId, companyId, candidateId, meetingData);
        console.log(`Réunion automatique planifiée avec succès: ${meetingResult?.id || 'ID non disponible'}`);
      } else {
        console.log(`Template de réunion ${meetingTemplateId} non trouvé`);
      }
    } else {
      console.log(`Pas de réunion automatique: isInterviewStage=${isInterviewStage}, meetingTemplateId=${meetingTemplateId}`);
    }
  } catch (error) {
    // Ne pas bloquer le processus si la planification de réunion échoue
    console.error('Erreur lors de la planification automatique de réunion:', error);
  }
  // ====== FIN DE LA FONCTIONNALITÉ ======

  return { 
    success: true, 
    message: `Candidate moved from ${currentStageName} to ${targetStageName}`,
    candidate: { id: candidateId },
    application: updatedApplication
  };
}
  
  // Nouvelle fonction : Ajouter un commentaire
  async addComment(userId, companyId, candidateId, commentData) {
    await checkCandidatePermission(userId, companyId);

    const { content, visibility = 'PUBLIC', mentionedUsers = [] } = commentData;

    if (!content || content.trim().length === 0) {
      throw new Error('Comment content is required.');
    }

    // Vérifier que le candidat existe
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        applications: { some: { job: { companyId } } }
      }
    });

    if (!candidate) {
      const error = new Error('Candidate not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          candidateId,
          content,
          authorId: userId,
          visibility,
          mentionedUsers: mentionedUsers || []
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } }
        }
      });

      // Créer une activité
      await tx.activity.create({
        data: {
          candidateId,
          type: 'COMMENT_ADDED',
          description: `Added a comment`,
          performedBy: userId,
          metadata: { 
            commentId: newComment.id, 
            visibility,
            hasContent: content.length > 100 
          }
        }
      });

      return newComment;
    });

    return comment;
  }

  // Nouvelle fonction : Obtenir les commentaires
  async getComments(userId, companyId, candidateId, queryParams = {}) {
    await checkCandidatePermission(userId, companyId);

    const { page = 1, limit = 10 } = queryParams;
    const skip = (page - 1) * limit;

    // Déterminer la visibilité selon le rôle
    const userMembership = await prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId, userId } }
    });

    let visibilityFilter = ['PUBLIC'];
    if (userMembership?.role === 'RECRUITING_ADMIN') {
      visibilityFilter = ['PUBLIC', 'PRIVATE', 'CONFIDENTIAL'];
    } else if (userMembership?.role === 'HIRING_MANAGER') {
      visibilityFilter = ['PUBLIC', 'PRIVATE'];
    }

    const comments = await prisma.comment.findMany({
      where: {
        candidateId,
        visibility: { in: visibilityFilter }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    const totalComments = await prisma.comment.count({
      where: {
        candidateId,
        visibility: { in: visibilityFilter }
      }
    });

    return {
      data: comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        totalCount: totalComments
      }
    };
  }

  // Nouvelle fonction : Envoyer un email
  // Dans backend/src/api/candidates/candidate.service.js

async sendEmail(userId, companyId, candidateId, emailData) {
  await checkCandidatePermission(userId, companyId);

  const { subject, content, templateId, scheduledFor } = emailData;

  const candidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      applications: { some: { job: { companyId } } }
    }
  });

  if (!candidate) {
    const error = new Error('Candidate not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  // Vérifier si le template existe si un templateId est fourni
  let template = null;
  if (templateId) {
    template = await prisma.messageTemplate.findUnique({
      where: { id: templateId }
    });
    if (!template) {
      // const error = new Error('Template not found.');
      // error.statusCode = 404;
      // throw error;
      console.warn('Template not found for templateId:', templateId);
    }
  }

  // Créer l'email et l'activité dans une transaction
  const email = await prisma.$transaction(async (tx) => {
    // 1. Créer l'email pour le candidat
    const newEmail = await tx.message.create({
      data: {
        senderId: userId,
        candidateId,
        subject,
        content,
        type: 'EMAIL',
        status: scheduledFor ? 'SCHEDULED' : 'SENT',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        templateId
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    // 2. Créer une activité
    await tx.activity.create({
      data: {
        candidateId,
        type: 'EMAIL_SENT',
        description: `Email ${scheduledFor ? 'scheduled' : 'sent'}: ${subject}`,
        performedBy: userId,
        metadata: { 
          emailId: newEmail.id, 
          scheduled: !!scheduledFor,
          subject
        }
      }
    });

    return newEmail;
  });

  // Si l'email n'est pas programmé, l'envoyer immédiatement
  if (!scheduledFor) {
    try {
      const sender = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, email: true }
      });

      const senderName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || sender.email;

      await emailService.sendEmail({
        to: candidate.email,
        subject,
        html: content,
        text: content.replace(/<[^>]*>/g, ''), // Version texte simple en enlevant les balises HTML
        attachments: [],
        from: `${senderName} <${config.email.user || 'noreply@recruitpme.com'}>`
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Ne pas échouer si l'envoi échoue, car l'email est déjà enregistré
    }
  }

  return email;
}

  // Nouvelle fonction : Obtenir les emails
  async getEmails(userId, companyId, candidateId, queryParams = {}) {
  await checkCandidatePermission(userId, companyId);

  const { page = 1, limit = 10 } = queryParams;
  const skip = (page - 1) * limit;

  // Vérifier que le candidat existe et est accessible
  const candidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      applications: { some: { job: { companyId } } }
    }
  });

  if (!candidate) {
    const error = new Error('Candidate not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  // Récupérer les emails
  const emails = await prisma.message.findMany({
    where: {
      candidateId
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, email: true } },
      template: { select: { id: true, name: true } }
    }
  });

  const totalEmails = await prisma.message.count({
    where: {
      candidateId
    }
  });

  return {
    data: emails,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalEmails / limit),
      totalCount: totalEmails
    }
  };
}


  // Dans backend/src/api/candidates/candidate.service.js
// Remplacez la fonction scheduleMeeting par celle-ci:

async scheduleMeeting(userId, companyId, candidateId, meetingData) {
  await checkCandidatePermission(userId, companyId);

  const { title, startTime, endTime, attendees = [], location, isGoogleMeet, description } = meetingData;

  const candidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      applications: { some: { job: { companyId } } }
    },
    include: {
      applications: {
        take: 1,
        include: {
          job: { select: { id: true, companyId: true } }
        }
      }
    }
  });

  if (!candidate) {
    const error = new Error('Candidate not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  // Récupérer les informations de l'organisateur
  const organizer = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true }
  });

  if (!organizer) {
    const error = new Error('Organizer not found.');
    error.statusCode = 404;
    throw error;
  }

  // Récupérer le jobId de la première application du candidat
  const jobId = candidate.applications[0]?.job?.id;

  const meeting = await prisma.$transaction(async (tx) => {
    // 1. Créer la réunion
    const newMeeting = await tx.meeting.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: isGoogleMeet ? 'Google Meet' : location,
        videoCallLink: isGoogleMeet ? `https://meet.google.com/${Math.random().toString(36).substring(2, 12)}` : null,
        organizerId: userId,
        candidateId,
        jobId,
        status: 'SCHEDULED'
      }
    });

    // 2. Ajouter l'organisateur comme participant
    await tx.meetingAttendee.create({
      data: {
        meetingId: newMeeting.id,
        userId: organizer.id,
        email: organizer.email,
        name: `${organizer.firstName} ${organizer.lastName}`.trim(),
        status: 'ACCEPTED'
      }
    });

    // 3. Ajouter le candidat comme participant (s'il n'est pas déjà dans la liste des participants)
    if (candidate.email && !attendees.some(a => a.email?.toLowerCase() === candidate.email?.toLowerCase())) {
      await tx.meetingAttendee.create({
        data: {
          meetingId: newMeeting.id,
          email: candidate.email,
          name: `${candidate.firstName} ${candidate.lastName}`.trim(),
          isCandidate: true,
          status: 'PENDING'
        }
      });
    }

    // 4. Ajouter les autres participants 
    // Vérifier que chaque email est unique pour ce meeting
    const uniqueAttendees = [];
    const emailsAlreadyAdded = new Set([organizer.email?.toLowerCase()]);
    
    if (candidate.email) {
      emailsAlreadyAdded.add(candidate.email.toLowerCase());
    }

    // Filtrer les participants pour éviter les doublons
    for (const attendee of attendees) {
      if (!attendee.email) continue;
      
      const email = attendee.email.toLowerCase();
      if (!emailsAlreadyAdded.has(email)) {
        uniqueAttendees.push(attendee);
        emailsAlreadyAdded.add(email);
      }
    }
    
    // Ajouter chaque participant unique
    for (const attendee of uniqueAttendees) {
      await tx.meetingAttendee.create({
        data: {
          meetingId: newMeeting.id,
          email: attendee.email,
          name: attendee.name || attendee.email.split('@')[0],
          userId: attendee.userId,
          status: 'PENDING'
        }
      });
    }

    // 5. Créer une activité
    await tx.activity.create({
      data: {
        candidateId,
        type: 'MEETING_SCHEDULED',
        description: `Meeting scheduled: ${title}`,
        performedBy: userId,
        metadata: { 
          meetingId: newMeeting.id,
          startTime,
          endTime
        }
      }
    });

    // Récupérer la réunion avec ses participants
    return await tx.meeting.findUnique({
      where: { id: newMeeting.id },
      include: {
        organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
        attendees: true
      }
    });
  });

  // Essayer de créer une invitation calendrier (ne pas bloquer si ça échoue)
  try {
    // Collecter tous les emails des participants
    const allAttendeeEmails = meeting.attendees
      .filter(att => att.email) // S'assurer que l'email existe
      .map(att => att.email);
    
    // Créer l'invitation (Google Calendar si configuré)
    if (allAttendeeEmails.length > 0) {
      await createMeetingInvitation({
        title: title || 'Entretien',
        description: description || '',
        startDateTime: startTime,
        endDateTime: endTime,
        attendeeEmails: allAttendeeEmails,
        location: meeting.location || '',
        includeGoogleMeet: isGoogleMeet,
        organizerEmail: organizer.email
      }).catch(err => console.error('Failed to create calendar invitation:', err));
    }
  } catch (error) {
    console.error('Error creating calendar invitation:', error);
    // Ne pas bloquer le processus si l'invitation calendrier échoue
  }

  // Envoyer un email au candidat si possible
  if (candidate.email) {
    try {
      // Formater la date et l'heure pour l'affichage
      let formattedDate = 'Date à confirmer';
      let formattedTime = 'Heure à confirmer';
      let durationMinutes = 30; // Valeur par défaut
      
      try {
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        
        formattedDate = startDate.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        formattedTime = startDate.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        durationMinutes = Math.round((endDate - startDate) / 60000);
      } catch (dateError) {
        console.error('Error formatting date/time:', dateError);
      }

      // Construire le nom de l'organisateur
      const organizerName = organizer.firstName && organizer.lastName
        ? `${organizer.firstName} ${organizer.lastName}`.trim()
        : organizer.email.split('@')[0];
      
      // Construire le nom du candidat
      const candidateName = candidate.firstName && candidate.lastName
        ? `${candidate.firstName} ${candidate.lastName}`.trim()
        : candidate.email.split('@')[0];

      // Version simplifiée de l'email sans pièce jointe ICS pour commencer
      await emailService.sendEmail({
        to: candidate.email,
        subject: `Invitation: ${title || 'Entretien'}`,
        html: `
          <h2>Invitation à un entretien</h2>
          <p>Bonjour ${candidateName},</p>
          <p>Vous avez été invité(e) à un entretien par <strong>${organizerName}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
            <h3 style="margin-top: 0; color: #4F46E5;">${title || 'Entretien'}</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Heure:</strong> ${formattedTime}</p>
            <p><strong>Durée:</strong> ${durationMinutes} minutes</p>
            <p><strong>Lieu:</strong> ${meeting.location || 'À distance'}</p>
            ${meeting.videoCallLink ? `<p><strong>Lien visioconférence:</strong> <a href="${meeting.videoCallLink}" style="color: #4F46E5;">${meeting.videoCallLink}</a></p>` : ''}
          </div>
          
          ${description ? `<h4>Description:</h4><p>${description}</p>` : ''}
          
          <p>Veuillez confirmer votre présence en répondant à cet email.</p>
          <p>Si vous avez des questions ou si vous souhaitez reporter cet entretien, n'hésitez pas à nous contacter.</p>
          
          <p>Cordialement,<br>${organizerName}</p>
        `
      }).catch(err => console.error('Failed to send invitation email:', err));
    } catch (error) {
      console.error('Error sending invitation email:', error);
      // Ne pas bloquer le processus si l'envoi d'email échoue
    }
  }

  return meeting;
}

  // Nouvelle fonction : Télécharger un fichier
  async uploadFile(userId, companyId, candidateId, fileData) {
    await checkCandidatePermission(userId, companyId);

    const { file, visibility = 'PUBLIC' } = fileData;

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        applications: { some: { job: { companyId } } }
      }
    });

    if (!candidate) {
      const error = new Error('Candidate not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    // Sauvegarder le fichier physiquement
    const fileUrl = await this.saveFile(file, 'candidate-files');

    const candidateFile = await prisma.$transaction(async (tx) => {
      const newFile = await tx.candidateFile.create({
        data: {
          candidateId,
          fileName: file.name,
          filePath: fileUrl,
          fileType: file.mimetype,
          fileSize: file.size,
          visibility,
          uploadedBy: userId
        },
        include: {
          uploader: { select: { id: true, firstName: true, lastName: true } }
        }
      });

      // Créer une activité
      await tx.activity.create({
        data: {
          candidateId,
          type: 'FILE_UPLOADED',
          description: `File uploaded: ${file.name}`,
          performedBy: userId,
          metadata: { 
            fileId: newFile.id, 
            fileName: file.name,
            fileSize: file.size,
            visibility
          }
        }
      });

      return newFile;
    });

    return candidateFile;
  }

  async getFiles(userId, companyId, candidateId) {
    await checkCandidatePermission(userId, companyId);

    const userMembership = await prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId, userId } }
    });

    let visibilityFilter = ['PUBLIC'];
    if (userMembership?.role === 'RECRUITING_ADMIN') {
      visibilityFilter = ['PUBLIC', 'PRIVATE'];
    }

    const files = await prisma.candidateFile.findMany({
      where: {
        candidateId,
        visibility: { in: visibilityFilter }
      },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return files;
  }

  // Nouvelle fonction : Supprimer un fichier
  async deleteFile(userId, companyId, candidateId, fileId) {
    await checkCandidatePermission(userId, companyId);

    const file = await prisma.candidateFile.findUnique({
      where: { id: fileId }
    });

    if (!file || file.candidateId !== candidateId) {
      const error = new Error('File not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    // Vérifier les permissions (seul l'auteur ou admin peut supprimer)
    const userMembership = await prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId, userId } }
    });

    if (file.uploadedBy !== userId && userMembership?.role !== 'RECRUITING_ADMIN') {
      const error = new Error('You can only delete files you uploaded.');
      error.statusCode = 403;
      throw error;
    }

    await prisma.$transaction(async (tx) => {
      // Supprimer l'enregistrement
      await tx.candidateFile.delete({ where: { id: fileId } });

      // Créer une activité
      await tx.activity.create({
        data: {
          candidateId,
          type: 'FILE_DELETED',
          description: `File deleted: ${file.fileName}`,
          performedBy: userId,
          metadata: { fileName: file.fileName }
        }
      });
    });

    // Supprimer le fichier physique
    try {
      await fs.unlink(path.join(process.cwd(), file.filePath));
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    return { message: 'File deleted successfully' };
  }

  async getActivity(userId, companyId, candidateId, queryParams = {}) {
    await checkCandidatePermission(userId, companyId);

    const { page = 1, limit = 20 } = queryParams;
    const skip = (page - 1) * limit;

    const activities = await prisma.activity.findMany({
      where: { candidateId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        performer: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    const totalActivities = await prisma.activity.count({
      where: { candidateId }
    });

    return {
      data: activities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalActivities / limit),
        totalCount: totalActivities
      }
    };
  }

  async getRatings(userId, companyId, candidateId) {
    await checkCandidatePermission(userId, companyId);

    // Obtenir l'application du candidat
    const application = await prisma.application.findFirst({
      where: {
        candidateId,
        job: { companyId }
      }
    });

    if (!application) {
      const error = new Error('Application not found.');
      error.statusCode = 404;
      throw error;
    }

    const ratings = await prisma.candidateRating.findMany({
      where: { applicationId: application.id },
      include: {
        rater: { select: { id: true, firstName: true, lastName: true } },
        ratingCardTemplate: { select: { id: true, name: true } }
        // stage: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return ratings;
  }

  // Fonctions utilitaires
  async saveFile(file, subfolder = 'general') {
    const uploadsDir = path.join(process.cwd(), 'uploads', subfolder);
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, file.buffer);
    return `/uploads/${subfolder}/${fileName}`;
  }

  

  async extractResumeContent(resumeUrl) {
    if (!resumeUrl) return null;

    try {
      const filePath = path.join(process.cwd(), resumeUrl);
      const fileExtension = path.extname(resumeUrl).toLowerCase();

      if (fileExtension === '.txt') {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
      } else if (fileExtension === '.pdf') {
        // Pour les PDF, installer pdf-parse si nécessaire
        try {
          const mod = await import('pdf-parse');
          const pdfParse = mod.default || mod;
          const buffer = await fs.readFile(filePath);
          const data = await pdfParse(buffer);
          return data.text;
        } catch (error) {
          console.error('Error parsing PDF:', error);
          return `Fichier PDF disponible: ${path.basename(resumeUrl)}`;
        }
      } else {
        return `Fichier CV disponible: ${path.basename(resumeUrl)}\nType: ${fileExtension}`;
      }
    } catch (error) {
      console.error('Error extracting resume content:', error);
      return `Erreur lors de la lecture du CV. Fichier: ${path.basename(resumeUrl)}`;
    }
  }

  // Fonctions existantes (conservées)
  async saveResumeFile(resumeFile) {
    if (!resumeFile) return null;

    const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileExtension = path.extname(resumeFile.originalname || resumeFile.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, resumeFile.buffer);
    return `/uploads/resumes/${fileName}`;
  }

  async createCandidate(userId, companyId, candidateData) {
    await checkCandidatePermission(userId, companyId);

  const { firstName, lastName, email, phone, job, comment, resume, stageId } = candidateData;

    if (!firstName || !lastName || !email || !job) {
      throw new Error('First name, last name, email, and job are required for a candidate.');
    }

    const existingCandidate = await prisma.candidate.findUnique({
      where: { email },
    });
    if (existingCandidate) {
      const error = new Error('A candidate with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    let resumeUrl = null;
    if (resume) {
      resumeUrl = await this.saveResumeFile(resume);
    }

    // We may need to assign a currentStage at creation if stageId provided
    // Fetch or create job workflow and stage upfront when stageId is present
    let resolvedStageId = null;
    if (stageId !== undefined && stageId !== null && stageId !== '') {
      // Ensure job belongs to company and has a workflow
      const jobRecord = await prisma.job.findUnique({
        where: { id: String(job) },
        include: { jobWorkflow: true },
      });
      if (!jobRecord || jobRecord.companyId !== companyId) {
        const err = new Error('Job not found or access denied.');
        err.statusCode = 404;
        throw err;
      }
      let jobWorkflow = jobRecord.jobWorkflow;
      if (!jobWorkflow) {
        jobWorkflow = await prisma.jobWorkflow.create({
          data: { jobId: jobRecord.id, name: `Workflow for ${jobRecord.title || 'Untitled Job'}` },
        });
      }

      // Try resolving stage by id first
      let stage = await prisma.jobWorkflowStage.findFirst({
        where: { jobWorkflowId: jobWorkflow.id, id: String(stageId) },
      });
      if (!stage) {
        // If not a direct id, try by numeric order
        const numeric = parseInt(stageId, 10);
        if (!isNaN(numeric)) {
          stage = await prisma.jobWorkflowStage.findFirst({
            where: { jobWorkflowId: jobWorkflow.id, order: numeric },
          });
        }
      }
      if (!stage) {
        // Create default stages if none exist for this workflow (mirrors moveCandidateToStage)
        const existingStages = await prisma.jobWorkflowStage.findMany({
          where: { jobWorkflowId: jobWorkflow.id },
        });
        if (existingStages.length === 0) {
          const defaults = [
            { name: 'Initial Review', type: 'AI_SCREENING', order: 0 },
            { name: 'Phone Screen', type: 'INTERVIEW', order: 1 },
            { name: 'Interview', type: 'INTERVIEW', order: 2 },
            { name: 'Offer', type: 'OFFER', order: 3 },
            { name: 'Hired', type: 'HIRED', order: 4 },
          ];
          for (const s of defaults) {
            try {
              await prisma.jobWorkflowStage.create({
                data: { jobWorkflowId: jobWorkflow.id, name: s.name, type: s.type, order: s.order },
              });
            } catch (_) { /* ignore */ }
          }
        }
        // Try resolving again
        const numeric = parseInt(stageId, 10);
        stage = await prisma.jobWorkflowStage.findFirst({
          where: {
            jobWorkflowId: jobWorkflow.id,
            ...(isNaN(numeric) ? {} : { order: numeric }),
          },
          orderBy: isNaN(numeric) ? { order: 'asc' } : undefined,
        });
        // If still not found and not numeric, fallback to first stage
        if (!stage) {
          const all = await prisma.jobWorkflowStage.findMany({ where: { jobWorkflowId: jobWorkflow.id }, orderBy: { order: 'asc' } });
          if (all.length > 0) stage = all[0];
        }
      }
      resolvedStageId = stage?.id || null;
    }

    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        resumeUrl,
        comment,
        applications: {
          create: {
            job: { connect: { id: String(job) } },
            status: 'ACTIVE',
            ...(resolvedStageId ? { currentStage: { connect: { id: resolvedStageId } } } : {}),
          },
        },
      },
    });

    // Créer une activité de création
    await prisma.activity.create({
      data: {
        candidateId: candidate.id,
        type: 'CANDIDATE_CREATED',
        description: `Candidate profile created`,
        performedBy: userId,
        metadata: { jobId: job }
      }
    });

    return candidate;
  }

  async updateCandidate(userId, companyId, id, candidateData) {
    await checkCandidatePermission(userId, companyId);

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { applications: { include: { job: true } } }
    });

    if (!candidate || !candidate.applications.some(app => app.job.companyId === companyId)) {
      const error = new Error('Candidate not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const { firstName, lastName, email, phone, comment, resume } = candidateData;

    let resumeUrl = candidate.resumeUrl;
    if (resume) {
      resumeUrl = await this.saveResumeFile(resume);
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        resumeUrl,
        comment,
      },
    });

    // Créer une activité de mise à jour
    await prisma.activity.create({
      data: {
        candidateId: id,
        type: 'CANDIDATE_UPDATED',
        description: `Candidate profile updated`,
        performedBy: userId,
        metadata: { changedFields: Object.keys(candidateData) }
      }
    });

    return updatedCandidate;
  }

  async deleteCandidate(userId, companyId, id) {
    await checkCandidatePermission(userId, companyId);

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { applications: { include: { job: true } } }
    });

    if (!candidate || !candidate.applications.some(app => app.job.companyId === companyId)) {
      const error = new Error('Candidate not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.candidate.delete({ where: { id } });

    return { message: 'Candidate deleted successfully.' };
  }

  async downloadCV(candidateId) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || !candidate.resumeUrl) {
      const error = new Error('CV not found.');
      error.statusCode = 404;
      throw error;
    }

    return candidate.resumeUrl;
  }

   
async findByJobAndStage(jobTitle, stageName) {
  // Recherche tous les candidats ayant une application pour le job et le stage demandés
  const candidates = await prisma.candidate.findMany({
    where: {
      applications: {
        some: {
          job: { title: { contains: jobTitle, mode: 'insensitive' } },
          currentStage: { name: { contains: stageName, mode: 'insensitive' } }
        }
      }
    },
    select: {
      firstName: true,
      lastName: true,
      email: true
    }
  });
  return candidates;
}


 

}

export default new CandidateService();