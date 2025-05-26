import express from 'express';
import JobController from './job.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createJobSchema,
  updateJobSchema,
  getJobsSchema,
  getJobByIdSchema
} from './job.validation.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole } = pkg;


const router = express.Router();

router.use(protect); // All job routes require authentication

// Option 1: Jobs nested under companies
// POST /api/v1/companies/:companyId/jobs
// GET /api/v1/companies/:companyId/jobs
// This is good for ensuring jobs are always company-scoped.
// The job.controller.js would then be mounted on company.routes.js for these.
// For simplicity here, I'll make them top-level but companyId will be required.

// Assuming companyId is passed in request body for creation, or jobs are fetched with company context
// router.post('/', JobController.createJob); // Expects companyId in req.body or req.user context
router.post('/', authorize([UserRole.ADMIN, UserRole.MEGA_ADMIN]), validate(createJobSchema), JobController.createJob);

// If using /companies/:companyId/jobs, then companyId comes from req.params

// Get jobs for a specific company (companyId as query param or path param)
// Example: GET /api/v1/jobs?companyId=xxx
router.get('/', JobController.getJobsByCompany); // This controller needs to extract companyId from query/params
router.get('/:jobId', validate(getJobByIdSchema), JobController.getJobById);
// router.get('/:jobId', JobController.getJobById);
// router.put('/:jobId', JobController.updateJob);
// router.delete('/:jobId', JobController.deleteJob);
router.put('/:id', authorize([UserRole.ADMIN, UserRole.MEGA_ADMIN]), validate(updateJobSchema), JobController.updateJob);
router.delete('/:id', authorize([UserRole.ADMIN, UserRole.MEGA_ADMIN]), validate(getJobByIdSchema), JobController.deleteJob);
// Hiring Team for a Job
router.get('/:jobId/hiring-team', JobController.getHiringTeam);
router.post('/:jobId/hiring-team', JobController.addHiringMember);
router.delete('/:jobId/hiring-team/:memberId', JobController.removeHiringMember);


// TODO: Routes for Application Form Fields for a Job
// POST /:jobId/application-form/fields
// GET /:jobId/application-form/fields
// PUT /:jobId/application-form/fields/:fieldId

export default router;