import express from 'express';
import RatingController from './rating.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// Rating Card Templates (scoped by company)
// Similar to workflows, better nested under /companies/:companyId/rating-card-templates
router.post('/companies/:companyId/rating-card-templates', RatingController.createRatingCardTemplate);
router.get('/companies/:companyId/rating-card-templates', RatingController.getRatingCardTemplatesByCompany);
router.get('/companies/:companyId/rating-card-templates/:templateId', RatingController.getRatingCardTemplateById);
router.put('/companies/:companyId/rating-card-templates/:templateId', RatingController.updateRatingCardTemplate);
router.delete('/companies/:companyId/rating-card-templates/:templateId', RatingController.deleteRatingCardTemplate);

// Candidate Ratings (scoped by application)
// An application belongs to a job, which belongs to a company. Access control is key.
router.post('/applications/:applicationId/ratings', RatingController.submitCandidateRating);
router.get('/applications/:applicationId/ratings', RatingController.getRatingsForApplication);

export default router;