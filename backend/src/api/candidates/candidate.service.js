// backend/src/api/candidates/candidate.service.js - Version étendue

import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
import fs from 'fs/promises';
import path from 'path';

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
      limit = 10, 
      stage, 
      jobId, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;
    
    const skip = (page - 1) * limit;
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
      skip,
      take: limit,
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
        currentPage: page,
        totalPages: Math.ceil(totalCandidates / limit),
        totalCount: totalCandidates,
        hasNext: page < Math.ceil(totalCandidates / limit),
        hasPrev: page > 1
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

  async moveCandidateToStage(userId, companyId, candidateId, stageId, comment = null) {
    await checkCandidatePermission(userId, companyId);

    const application = await prisma.application.findFirst({
      where: {
        candidateId,
        job: { companyId }
      },
      include: {
        candidate: true,
        job: true,
        currentStage: true
      }
    });

    if (!application) {
      const error = new Error('Application not found.');
      error.statusCode = 404;
      throw error;
    }

   
    console.log("moveCandidateToStage - stageId: ",stageId);
    const newStage = await prisma.jobWorkflowStage.findUnique({ 
      where: { id: stageId } 
    });
    
    if (!newStage) {
      const error = new Error('Stage not found.');
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour l'application
      const updatedApplication = await tx.application.update({
        where: { id: application.id },
        data: { 
          currentStageId: stageId,
          updatedAt: new Date()
        }
      });

      // Créer une activité
      await tx.activity.create({
        data: {
          candidateId,
          type: 'STAGE_CHANGE',
          description: `Moved from ${application.currentStage?.name || 'Unknown'} to ${newStage.name}`,
          performedBy: userId,
          metadata: {
            fromStageId: application.currentStageId,
            fromStageName: application.currentStage?.name,
            toStageId: stageId,
            toStageName: newStage.name,
            comment
          }
        }
      });

      // Ajouter un commentaire si fourni
      if (comment) {
        await tx.comment.create({
          data: {
            candidateId,
            content: comment,
            authorId: userId,
            visibility: 'PUBLIC'
          }
        });
      }

      return updatedApplication;
    });

    return { message: 'Candidate moved successfully', data: result };
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

    const email = await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          senderId: userId,
          recipientId: candidateId, // Note: Ceci suppose que candidateId peut être utilisé comme recipientId
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

      // Créer une activité
      await tx.activity.create({
        data: {
          candidateId,
          type: 'EMAIL_SENT',
          description: `Email ${scheduledFor ? 'scheduled' : 'sent'}: ${subject}`,
          performedBy: userId,
          metadata: { 
            messageId: newMessage.id, 
            scheduled: !!scheduledFor,
            subject
          }
        }
      });

      return newMessage;
    });

    return email;
  }

  // Nouvelle fonction : Obtenir les emails
  async getEmails(userId, companyId, candidateId, queryParams = {}) {
    await checkCandidatePermission(userId, companyId);

    const { page = 1, limit = 10 } = queryParams;
    const skip = (page - 1) * limit;

    const emails = await prisma.message.findMany({
      where: {
        recipientId: candidateId,
        type: 'EMAIL'
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
        recipientId: candidateId,
        type: 'EMAIL'
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


  async scheduleMeeting(userId, companyId, candidateId, meetingData) {
    await checkCandidatePermission(userId, companyId);

    const { title, startTime, endTime, attendees = [], location, isGoogleMeet, description } = meetingData;

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

    const meeting = await prisma.$transaction(async (tx) => {
      const newMeeting = await tx.meeting.create({
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          location: isGoogleMeet ? 'Google Meet' : location,
          videoCallLink: isGoogleMeet ? 'https://meet.google.com/new' : null,
          organizerId: userId,
          candidateId,
          status: 'SCHEDULED',
          attendees: {
            create: [
              {
                email: candidate.email,
                name: `${candidate.firstName} ${candidate.lastName}`,
                isCandidate: true,
                status: 'PENDING'
              },
              ...attendees.map(att => ({
                email: att.email,
                name: att.name,
                userId: att.userId,
                isCandidate: false,
                status: 'PENDING'
              }))
            ]
          }
        },
        include: {
          attendees: true,
          organizer: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
      });

      // Créer une activité
      await tx.activity.create({
        data: {
          candidateId,
          type: 'MEETING_SCHEDULED',
          description: `Meeting scheduled: ${title}`,
          performedBy: userId,
          metadata: { 
            meetingId: newMeeting.id, 
            startTime, 
            endTime,
            attendeeCount: attendees.length + 1 // +1 pour le candidat
          }
        }
      });

      return newMeeting;
    });

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

    const { firstName, lastName, email, phone, job, comment, resume } = candidateData;

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
}

export default new CandidateService();