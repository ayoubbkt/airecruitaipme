import WorkflowService from './workflow.service.js';

class WorkflowController {
  // Workflow Templates
  async createWorkflowTemplate(req, res, next) {
    try {
      const { companyId } = req.params;
      // TODO: Validate req.body (name, stages array)
      const template = await WorkflowService.createWorkflowTemplate(req.user.id, companyId, req.body);
      res.status(201).json({ message: 'Workflow template created.', data: template });
    } catch (error) {
      next(error);
    }
  }

  async getWorkflowTemplateById(req, res, next) {
    try {
      const { companyId, templateId } = req.params;
      const template = await WorkflowService.getWorkflowTemplateById(req.user.id, companyId, templateId);
      res.status(200).json({ data: template });
    } catch (error) {
      next(error);
    }
  }

  async getWorkflowTemplatesByCompany(req, res, next) {
    try {
      const { companyId } = req.params;
      const templates = await WorkflowService.getWorkflowTemplatesByCompany(req.user.id, companyId);
      res.status(200).json({ data: templates });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkflowTemplate(req, res, next) {
    try {
      const { companyId, templateId } = req.params;
      // TODO: Validate req.body
      const updatedTemplate = await WorkflowService.updateWorkflowTemplate(req.user.id, companyId, templateId, req.body);
      res.status(200).json({ message: 'Workflow template updated.', data: updatedTemplate });
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkflowTemplate(req, res, next) {
    try {
      const { companyId, templateId } = req.params;
      await WorkflowService.deleteWorkflowTemplate(req.user.id, companyId, templateId);
      res.status(200).json({ message: 'Workflow template deleted.' });
    } catch (error) {
      next(error);
    }
  }

  // Job Workflow Instance
  async assignWorkflowToJob(req, res, next) {
    try {
      const { companyId, jobId } = req.params; // Assuming companyId is in path for clarity
      const { templateId } = req.body;
      if (!templateId) {
        const error = new Error('templateId is required in the body.');
        error.statusCode = 400;
        throw error;
      }
      const jobWorkflow = await WorkflowService.assignWorkflowToJob(req.user.id, companyId, jobId, templateId);
      res.status(200).json({ message: 'Workflow assigned to job.', data: jobWorkflow });
    } catch (error) {
      next(error);
    }
  }

  async getJobWorkflow(req, res, next) {
    try {
      const { jobId } = req.params;
      const jobWorkflow = await WorkflowService.getJobWorkflow(req.user.id, jobId);
      res.status(200).json({ data: jobWorkflow });
    } catch (error) {
      next(error);
    }
  }

  async updateJobWorkflowStageSettings(req, res, next) {
    try {
        const { jobId, stageId } = req.params;
        // TODO: Validate req.body (newSettings JSON)
        const updatedStage = await WorkflowService.updateJobWorkflowStageSettings(req.user.id, jobId, stageId, req.body.settings);
        res.status(200).json({ message: 'Job workflow stage settings updated.', data: updatedStage });
    } catch (error) {
        next(error);
    }
  }
}

export default new WorkflowController();