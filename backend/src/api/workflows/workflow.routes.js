import express from 'express';
import WorkflowController from './workflow.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createWorkflowSchema,
  updateWorkflowSchema,
  updateStageSchema
} from './workflow.validation.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole } = pkg;


const router = express.Router();
router.use(protect);

// Workflow Templates (scoped by company)
// Assumes companyId will be part of the path, e.g., /api/v1/companies/:companyId/workflow-templates
// For this example, I'll keep it flat and expect companyId in params for clarity in controller.
// A better practice is to nest these routes under /companies/:companyId/

router.post('/companies/:companyId/templates', WorkflowController.createWorkflowTemplate);
router.get('/companies/:companyId/templates', WorkflowController.getWorkflowTemplatesByCompany);
router.get('/companies/:companyId/templates/:templateId', WorkflowController.getWorkflowTemplateById);
router.put('/companies/:companyId/templates/:templateId', WorkflowController.updateWorkflowTemplate);
router.delete('/companies/:companyId/templates/:templateId', WorkflowController.deleteWorkflowTemplate);

// Job Workflow Instances
// Assign template to a job (companyId helps scope)
router.post('/companies/:companyId/jobs/:jobId/assign-workflow', WorkflowController.assignWorkflowToJob);
// Get the specific workflow for a job
router.get('/jobs/:jobId/workflow', WorkflowController.getJobWorkflow);
// Update settings for a specific stage within a job's workflow
router.patch('/jobs/:jobId/workflow/stages/:stageId/settings', WorkflowController.updateJobWorkflowStageSettings);


export default router;