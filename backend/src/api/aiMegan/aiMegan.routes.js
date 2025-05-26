import express from 'express';
import AiMeganController from './aiMegan.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// Company-level AI Preferences
router.get('/companies/:companyId/preferences/business', AiMeganController.getAIBusinessPreferences);
router.put('/companies/:companyId/preferences/business', AiMeganController.updateAIBusinessPreferences);
router.get('/companies/:companyId/preferences/communication', AiMeganController.getAICommunicationPreferences);
router.put('/companies/:companyId/preferences/communication', AiMeganController.updateAICommunicationPreferences);

// Job/Meeting specific AI feature configurations
router.get('/jobs/:jobId/config/screening', AiMeganController.getAIScreeningConfig);
router.put('/jobs/:jobId/config/screening', AiMeganController.configureAIScreening);

router.get('/jobs/:jobId/config/scheduling', AiMeganController.getAISchedulingConfig);
router.put('/jobs/:jobId/config/scheduling', AiMeganController.configureAIScheduling);

router.get('/meetings/:meetingId/config/note-taking', AiMeganController.getAINoteTakingConfig);
router.put('/meetings/:meetingId/config/note-taking', AiMeganController.configureAINoteTaking);

// AI Interaction Logging
router.post('/interactions/log', AiMeganController.logAIInteraction); // Could be restricted to system/AI service
router.get('/interactions/logs', AiMeganController.getAIInteractionLogs); // User gets their own, admin gets all

export default router;