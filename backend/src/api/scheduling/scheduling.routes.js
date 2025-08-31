import express from 'express';
import SchedulingController from './scheduling.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// Meeting Templates (scoped by company)
router.post('/companies/:companyId/meeting-templates', SchedulingController.createMeetingTemplate);
router.get('/companies/:companyId/meeting-templates', SchedulingController.getMeetingTemplatesByCompany);
router.put('/companies/:companyId/meeting-templates/:id', SchedulingController.updateMeetingTemplate);
router.delete('/companies/:companyId/meeting-templates/:id', SchedulingController.deleteMeetingTemplate); // Nouvelle route pour la suppression

// Meetings
router.post('/meetings', SchedulingController.scheduleMeeting);
router.get('/meetings/my-meetings', SchedulingController.getMyMeetings); // Get meetings for the logged-in user
router.get('/meetings/:meetingId', SchedulingController.getMeetingById);
// TODO: Add PUT /meetings/:meetingId, DELETE /meetings/:meetingId
// TODO: Add POST /meetings/:meetingId/attendees/:attendeeId/status (for RSVP)

export default router;