// backend/src/api/candidates/candidate.routes.js - Version étendue

import express from 'express';
import CandidateController from './candidate.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(protect);

// Routes de base existantes
router.get('/companies/:companyId/candidates', CandidateController.getCandidates);
router.get('/companies/:companyId/candidates/:id', CandidateController.getCandidateById);
router.post('/companies/:companyId/candidates', upload.single('resume'), CandidateController.createCandidate);
router.put('/companies/:companyId/candidates/:id', CandidateController.updateCandidate);
router.delete('/companies/:companyId/candidates/:id', CandidateController.deleteCandidate);
router.get('/candidates/:id/download-cv', CandidateController.downloadCV);

// Nouvelles routes pour la gestion des candidats par stage
router.get('/companies/:companyId/stages/:stageId/candidates', CandidateController.getCandidatesByStage);
router.post('/companies/:companyId/candidates/:candidateId/move-to-stage', CandidateController.moveCandidateToStage);

// Routes pour les commentaires
router.post('/companies/:companyId/candidates/:candidateId/comments', CandidateController.addComment);
router.get('/companies/:companyId/candidates/:candidateId/comments', CandidateController.getComments);

// Routes pour l'activité
router.get('/companies/:companyId/candidates/:candidateId/activity', CandidateController.getActivity);

// Routes pour les emails/messages
router.post('/companies/:companyId/candidates/:candidateId/emails', CandidateController.sendEmail);
router.get('/companies/:companyId/candidates/:candidateId/emails', CandidateController.getEmails);

// Routes pour les réunions
router.post('/companies/:companyId/candidates/:candidateId/meetings', CandidateController.scheduleMeeting);

// Routes pour les fichiers
router.post('/companies/:companyId/candidates/:candidateId/files', upload.single('file'), CandidateController.uploadFile);
router.get('/companies/:companyId/candidates/:candidateId/files', CandidateController.getFiles);
router.delete('/companies/:companyId/candidates/:candidateId/files/:fileId', CandidateController.deleteFile);

// Routes pour les ratings
router.get('/companies/:companyId/candidates/:candidateId/ratings', CandidateController.getRatings);

export default router;