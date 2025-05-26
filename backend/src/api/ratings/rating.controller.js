import RatingService from './rating.service.js';

class RatingController {
  // Rating Card Templates
  async createRatingCardTemplate(req, res, next) {
    try {
      const { companyId } = req.params;
      // TODO: Validate req.body
      const template = await RatingService.createRatingCardTemplate(req.user.id, companyId, req.body);
      res.status(201).json({ message: 'Rating card template created.', data: template });
    } catch (error) {
      next(error);
    }
  }

  async getRatingCardTemplatesByCompany(req, res, next) {
    try {
      const { companyId } = req.params;
      const templates = await RatingService.getRatingCardTemplatesByCompany(req.user.id, companyId);
      res.status(200).json({ data: templates });
    } catch (error) {
      next(error);
    }
  }

  async getRatingCardTemplateById(req, res, next) {
    try {
        const { companyId, templateId } = req.params;
        const template = await RatingService.getRatingCardTemplateById(req.user.id, companyId, templateId);
        res.status(200).json({ data: template });
    } catch (error) {
        next(error);
    }
  }

  async updateRatingCardTemplate(req, res, next) {
    try {
      const { companyId, templateId } = req.params;
      // TODO: Validate req.body
      const updatedTemplate = await RatingService.updateRatingCardTemplate(req.user.id, companyId, templateId, req.body);
      res.status(200).json({ message: 'Rating card template updated.', data: updatedTemplate });
    } catch (error) {
      next(error);
    }
  }

  async deleteRatingCardTemplate(req, res, next) {
    try {
      const { companyId, templateId } = req.params;
      await RatingService.deleteRatingCardTemplate(req.user.id, companyId, templateId);
      res.status(200).json({ message: 'Rating card template deleted.' });
    } catch (error) {
      next(error);
    }
  }

  // Candidate Ratings
  async submitCandidateRating(req, res, next) {
    try {
      const { applicationId } = req.params;
      // TODO: Validate req.body (ratingCardTemplateId, overallScore, etc.)
      const rating = await RatingService.submitCandidateRating(req.user.id, applicationId, req.body);
      res.status(201).json({ message: 'Candidate rating submitted.', data: rating });
    } catch (error) {
      next(error);
    }
  }

  async getRatingsForApplication(req, res, next) {
    try {
      const { applicationId } = req.params;
      const ratings = await RatingService.getRatingsForApplication(req.user.id, applicationId);
      res.status(200).json({ data: ratings });
    } catch (error) {
      next(error);
    }
  }
}

export default new RatingController();