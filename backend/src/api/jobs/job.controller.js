import JobService from './job.service.js';

class JobController {
  async createJob(req, res, next) {
    try {
      const { companyId } = req.params;
      const jobData = {
        ...req.body,
        applicationFormFields: req.body.applicationFields ? Object.entries(req.body.applicationFields).map(([name, field]) => ({ name, required: field.required })) : [],
        hiringTeam: req.body.hiringTeam || [],
        workflowId: req.body.workflowId,
        minYearsExperience: req.body.minYearsExperience,
        skills: {
          required: req.body.requiredSkills || [],
          preferred: req.body.preferredSkills || [],
        },
      };
      const job = await JobService.createJob(req.user.id, companyId, jobData);
      res.status(201).json({ message: 'Job created successfully', data: job });
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req, res, next) {
    try {
       
      const job = await JobService.getJobById(req.user.id, req.params.jobId);
      res.status(200).json({ data: job });
    } catch (error) {
     
      next(error);
    }
  }

  async getJobsByCompany(req, res, next) {
    try {
      const { companyId } = req.params;
      const jobs = await JobService.getJobsByCompany(req.user.id, companyId, req.query);
      res.status(200).json(jobs);
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req, res, next) {
    try {
      const updatedJob = await JobService.updateJob(req.user.id, req.params.jobId, {
        ...req.body,
        applicationFormFields: req.body.applicationFields ? Object.entries(req.body.applicationFields).map(([name, field]) => ({ name, required: field.required })) : [],
        hiringTeam: req.body.hiringTeam || [],
        workflowId: req.body.workflowId,
        minYearsExperience: req.body.minYearsExperience,
        skills: {
          required: req.body.requiredSkills || [],
          preferred: req.body.preferredSkills || [],
        },
      });
      res.status(200).json({ message: 'Job updated successfully', data: updatedJob });
    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req, res, next) {
    try {
      const result = await JobService.deleteJob(req.user.id, req.params.jobId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async addHiringMember(req, res, next) {
    try {
      const { jobId } = req.params;
      const member = await JobService.addHiringMember(req.user.id, jobId, req.body);
      res.status(201).json({ message: 'Hiring member added.', data: member });
    } catch (error) {
      next(error);
    }
  }

  async removeHiringMember(req, res, next) {
    try {
      const { jobId, memberId } = req.params;
      const result = await JobService.removeHiringMember(req.user.id, jobId, memberId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHiringTeam(req, res, next) {
    try {
      const { jobId } = req.params;
      const team = await JobService.getHiringTeam(req.user.id, jobId);
      res.status(200).json({ data: team });
    } catch (error) {
      next(error);
    }
  }
}

export default new JobController();