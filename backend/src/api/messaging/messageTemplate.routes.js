import express from 'express';
import MessageTemplateController from './messageTemplate.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// Message Templates (scoped by company)
router.get('/companies/:companyId/message-templates', MessageTemplateController.getMessageTemplates);
router.get('/companies/:companyId/message-templates/:id', MessageTemplateController.getMessageTemplateById);
router.post('/companies/:companyId/message-templates', MessageTemplateController.createMessageTemplate);
router.put('/companies/:companyId/message-templates/:id', MessageTemplateController.updateMessageTemplate);
router.delete('/companies/:companyId/message-templates/:id', MessageTemplateController.deleteMessageTemplate);

export default router;