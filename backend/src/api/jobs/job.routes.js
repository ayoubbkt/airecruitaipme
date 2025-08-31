import express from 'express';
import JobController from './job.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createJobSchema,
  updateJobSchema,
  getJobsSchema,
  getJobByIdSchema,
} from './job.validation.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole } = pkg;

const router = express.Router();

router.use(protect);

router.post('/companies/:companyId/jobs', authorize([UserRole.ADMIN, UserRole.MEGA_ADMIN]), validate(createJobSchema), JobController.createJob);
router.get('/companies/:companyId/jobs', validate(getJobsSchema), JobController.getJobsByCompany);
router.get('/companies/:companyId/jobs/:jobId', validate(getJobByIdSchema), JobController.getJobById);
router.put('/companies/:companyId/jobs/:id', authorize([UserRole.ADMIN, UserRole.MEGA_ADMIN]), validate(updateJobSchema), JobController.updateJob);
router.delete('/companies/:companyId/jobs/:id', authorize([UserRole.ADMIN, UserRole.MEGA_ADMIN]), validate(getJobByIdSchema), JobController.deleteJob);
router.get('/companies/:companyId/jobs/:jobId/hiring-team', JobController.getHiringTeam);
router.post('/companies/:companyId/jobs/:jobId/hiring-team', JobController.addHiringMember);
router.delete('/companies/:companyId/jobs/:jobId/hiring-team/:memberId', JobController.removeHiringMember);

export default router;