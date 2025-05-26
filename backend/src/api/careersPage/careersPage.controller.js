import CareersPageService from './careersPage.service.js';

class CareersPageController {
  // For internal management by company admins
  async getMyCompanyCareersPageSettings(req, res, next) {
    try {
      // Assuming companyId is determined from req.user's context (e.g., selected company)
      // For this example, let's take it from params, but in a real app, it'd be more contextual.
      const { companyId } = req.params;
      // A check should ensure req.user has rights to companyId
      const settings = await CareersPageService.getCareersPageSettings(companyId);
      res.status(200).json({ data: settings });
    } catch (error) {
      next(error);
    }
  }

  async updateMyCompanyCareersPageSettings(req, res, next) {
    try {
      const { companyId } = req.params;
      // TODO: Validate req.body
      const settings = await CareersPageService.updateCareersPageSettings(req.user.id, companyId, req.body);
      res.status(200).json({ message: 'Careers page settings updated.', data: settings });
    } catch (error) {
      next(error);
    }
  }

  // Publicly accessible for candidates viewing a company's career page
  async getPublicCareersPageInfo(req, res, next) {
    try {
      const { companyIdOrSubdomain } = req.params; // Could be ID or a custom subdomain
      // Resolve companyId from companyIdOrSubdomain
      // For now, assume it's companyId
      const companyId = companyIdOrSubdomain;
      
      const settings = await CareersPageService.getCareersPageSettings(companyId);
      const jobsData = await CareersPageService.getPublishedJobsForCareersPage(companyId, req.query);
      
      res.status(200).json({
        settings,
        jobs: jobsData.data,
        totalJobs: jobsData.totalJobs
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CareersPageController();