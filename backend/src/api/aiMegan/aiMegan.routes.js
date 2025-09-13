// backend/src/api/aiMegan/aiMegan.routes.js (REMPLACER COMPLÈTEMENT)
import express from 'express';
import AiMeganController from './aiMegan.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// === ROUTES EXISTANTES (garder) ===
router.get('/companies/:companyId/preferences/business', AiMeganController.getAIBusinessPreferences);
router.put('/companies/:companyId/preferences/business', AiMeganController.updateAIBusinessPreferences);
router.get('/companies/:companyId/preferences/communication', AiMeganController.getAICommunicationPreferences);
router.put('/companies/:companyId/preferences/communication', AiMeganController.updateAICommunicationPreferences);

router.get('/jobs/:jobId/config/screening', AiMeganController.getAIScreeningConfig);
router.put('/jobs/:jobId/config/screening', AiMeganController.configureAIScreening);
router.get('/jobs/:jobId/config/scheduling', AiMeganController.getAISchedulingConfig);
router.put('/jobs/:jobId/config/scheduling', AiMeganController.configureAIScheduling);
router.get('/meetings/:meetingId/config/note-taking', AiMeganController.getAINoteTakingConfig);
router.put('/meetings/:meetingId/config/note-taking', AiMeganController.configureAINoteTaking);

router.post('/interactions/log', AiMeganController.logAIInteraction);
router.get('/interactions/logs', AiMeganController.getAIInteractionLogs);

// === NOUVELLES ROUTES MEGAN ===
router.post('/chat', AiMeganController.chatWithMegan);
router.post('/screening/:jobId/:candidateId', AiMeganController.executeAIScreening);
router.post('/scheduling/:jobId/:candidateId', AiMeganController.executeAIScheduling);
router.post('/note-taking/:meetingId', AiMeganController.executeAINoteTaking);
router.get('/conversations', AiMeganController.getConversations);
router.get('/conversations/:conversationId', AiMeganController.getConversationStatus);

// Webhook (sans auth pour Intercom)
// router.post('/webhook/intercom', (req, res, next) => {
//   req.skipAuth = true;
//   next();
// }, AiMeganController.handleIntercomWebhook);

const publicRouter = express.Router();
publicRouter.post('/webhook/intercom', AiMeganController.handleIntercomWebhook);

export default router;
export { publicRouter };

