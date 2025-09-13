// backend/src/api/candidates/candidate.controller.js - Version étendue

import CandidateService from './candidate.service.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

class CandidateController {
  async getCandidates(req, res, next) {
    try {
      const { companyId } = req.params;
      const queryParams = req.query;
      
      const candidates = await CandidateService.getCandidates(req.user.id, companyId, queryParams);
      res.status(200).json(candidates);
    } catch (error) {
      next(error);
    }
  }

  async getCandidateById(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const candidate = await CandidateService.getCandidateById(req.user.id, companyId, id);
      res.status(200).json(candidate);
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Obtenir les candidats par stage
  async getCandidatesByStage(req, res, next) {
    try {
      const { companyId, stageId } = req.params;
      const candidates = await CandidateService.getCandidatesByStage(req.user.id, companyId, stageId);
      res.status(200).json(candidates);
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Déplacer un candidat vers un stage
  async moveCandidateToStage(req, res, next) {
    try {
      const { companyId, candidateId } = req.params;
      const { stageId, comment } = req.body;
      console.log("stageId, comment,companyId, candidateId",stageId, comment,companyId, candidateId)
      const result = await CandidateService.moveCandidateToStage(
        req.user.id, 
        companyId, 
        candidateId, 
        stageId, 
        comment
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Ajouter un commentaire sur un candidat
  async addComment(req, res, next) {
    try {
      const { companyId, candidateId } = req.params;
      const { content, visibility, mentionedUsers } = req.body;
      const comment = await CandidateService.addComment(
        req.user.id,
        companyId,
        candidateId,
        { content, visibility, mentionedUsers }
      );
      res.status(201).json({ message: 'Comment added successfully', data: comment });
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Obtenir les commentaires d'un candidat
  async getComments(req, res, next) {
    try {
      const { companyId, candidateId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const comments = await CandidateService.getComments(
        req.user.id,
        companyId,
        candidateId,
        { page: parseInt(page), limit: parseInt(limit) }
      );
      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Envoyer un email au candidat
  async sendEmail(req, res, next) {
    try {
      const { companyId, candidateId } = req.params;
      const { subject, content, templateId, scheduledFor } = req.body;
      const result = await CandidateService.sendEmail(
        req.user.id,
        companyId,
        candidateId,
        { subject, content, templateId, scheduledFor }
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Programmer une réunion
  async scheduleMeeting(req, res, next) {
    try {
      const { companyId, candidateId } = req.params;
      const meetingData = {
        title: req.body.title,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        attendees: req.body.attendees,
        location: req.body.location,
        isGoogleMeet: req.body.isGoogleMeet,
        description: req.body.description
      };
      const meeting = await CandidateService.scheduleMeeting(
        req.user.id,
        companyId,
        candidateId,
        meetingData
      );
      res.status(201).json({ message: 'Meeting scheduled successfully', data: meeting });
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Télécharger un fichier/attachement
  async uploadFile(req, res, next) {
    try {
      const { companyId, candidateId } = req.params;
      const { visibility = 'PUBLIC' } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file provided' });
      }

      const fileData = {
        file: {
          name: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer: req.file.buffer
        },
        visibility,
        uploadedBy: req.user.id
      };

      const file = await CandidateService.uploadFile(req.user.id, companyId, candidateId, fileData);
      res.status(201).json({ message: 'File uploaded successfully', data: file });
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Obtenir les fichiers d'un candidat
  async getFiles(req, res, next) {
    try {
      const { companyId, candidateId } = req.params;
      const files = await CandidateService.getFiles(req.user.id, companyId, candidateId);
      res.status(200).json({ data: files });
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Supprimer un fichier
  async deleteFile(req, res, next) {
    try {
      const { companyId, candidateId, fileId } = req.params;
      const result = await CandidateService.deleteFile(req.user.id, companyId, candidateId, fileId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Obtenir l'activité d'un candidat
  async getActivity(req, res, next) {
    try {
      const { companyId, candidateId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const activity = await CandidateService.getActivity(
        req.user.id,
        companyId,
        candidateId,
        { page: parseInt(page), limit: parseInt(limit) }
      );
      res.status(200).json(activity);
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Obtenir les emails du candidat
  async getEmails(req, res, next) {
    try {
      const { companyId, candidateId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const emails = await CandidateService.getEmails(
        req.user.id,
        companyId,
        candidateId,
        { page: parseInt(page), limit: parseInt(limit) }
      );
      res.status(200).json(emails);
    } catch (error) {
      next(error);
    }
  }

  // Nouveau : Obtenir les ratings d'un candidat
  async getRatings(req, res, next) {
    try {
      const { companyId, candidateId } = req.params;
      const ratings = await CandidateService.getRatings(req.user.id, companyId, candidateId);
      res.status(200).json({ data: ratings });
    } catch (error) {
      next(error);
    }
  }

  // Existant
  async createCandidate(req, res, next) {
    try {
      const { companyId } = req.params;
      const resumeFile = req.file ? {
        name: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer
      } : null;

      const candidateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        job: String(req.body.job),
        comment: req.body.comment,
  resume: resumeFile,
  // Optional: allow creating directly in a specific stage (either stage id or order)
  stageId: req.body.stageId,
      };

      const candidate = await CandidateService.createCandidate(req.user.id, companyId, candidateData);
      res.status(201).json({ message: 'Candidate created.', data: candidate });
    } catch (error) {
      next(error);
    }
  }

  async updateCandidate(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const candidateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        comment: req.body.comment,
        resume: req.body.resume,
      };
      const updatedCandidate = await CandidateService.updateCandidate(req.user.id, companyId, id, candidateData);
      res.status(200).json({ message: 'Candidate updated.', data: updatedCandidate });
    } catch (error) {
      next(error);
    }
  }

  async deleteCandidate(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const result = await CandidateService.deleteCandidate(req.user.id, companyId, id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async downloadCV(req, res, next) {
    try {
      const { id } = req.params;
      const cvUrl = await CandidateService.downloadCV(id);
      res.status(200).json({ url: cvUrl });
    } catch (error) {
      next(error);
    }
  }
}

export default new CandidateController();