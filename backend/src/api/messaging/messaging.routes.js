import express from 'express';
import MessagingController from './messaging.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// Messages are scoped by application
router.post('/applications/:applicationId/messages', MessagingController.sendMessage);
router.get('/applications/:applicationId/messages', MessagingController.getMessagesForApplication);

export default router;