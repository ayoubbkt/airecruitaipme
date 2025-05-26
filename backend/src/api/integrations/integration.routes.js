import express from 'express';
import IntegrationController from './integration.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Calendar Integrations
// Step 1: Frontend calls this to get the OAuth URL
router.get('/calendar/:provider/connect', protect, IntegrationController.initiateCalendarConnection);

// Step 2: Provider redirects to this callback URL after user consent.
// This route might not need 'protect' if state parameter is used for security,
// but for simplicity and if cookies are set, 'protect' can help re-establish user session.
// However, often the user is already logged into MegaHR when they initiate.
router.get('/calendar/google/callback', protect, IntegrationController.handleGoogleCalendarCallback);
// router.get('/calendar/outlook/callback', protect, IntegrationController.handleOutlookCalendarCallback);

router.get('/calendar/my-integrations', protect, IntegrationController.getMyCalendarIntegrations);
router.delete('/calendar/:provider/disconnect', protect, IntegrationController.disconnectCalendar);

// TODO: Job Board Integration Routes (company-scoped)
// POST /companies/:companyId/integrations/job-boards/:boardName/connect
// GET /companies/:companyId/integrations/job-boards
// DELETE /companies/:companyId/integrations/job-boards/:boardName/disconnect

export default router;