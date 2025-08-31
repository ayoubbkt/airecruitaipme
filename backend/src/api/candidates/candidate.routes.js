import express from 'express';
import CandidateController from './candidate.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(protect);

// Candidates (scoped by company)
router.get('/companies/:companyId/candidates', CandidateController.getCandidates);
router.get('/companies/:companyId/candidates/:id', CandidateController.getCandidateById);
router.post('/companies/:companyId/candidates', upload.single('resume'), CandidateController.createCandidate);
router.put('/companies/:companyId/candidates/:id', CandidateController.updateCandidate);
router.delete('/companies/:companyId/candidates/:id', CandidateController.deleteCandidate);
router.get('/candidates/:id/download-cv', CandidateController.downloadCV);


export default router;

 