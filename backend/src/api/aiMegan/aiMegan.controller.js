import AiMeganService from './aiMegan.service.js';

class AiMeganController {
  // Business & Communication Preferences
  async getAIBusinessPreferences(req, res, next) {
    try {
      const { companyId } = req.params;
      const prefs = await AiMeganService.getAIBusinessPreferences(req.user.id, companyId);
      res.status(200).json({ data: prefs });
    } catch (error) {
      next(error);
    }
  }

  async updateAIBusinessPreferences(req, res, next) {
    try {
      const { companyId } = req.params;
      // TODO: Validate req.body
      const prefs = await AiMeganService.updateAIBusinessPreferences(req.user.id, companyId, req.body);
      res.status(200).json({ message: 'AI Business Preferences updated.', data: prefs });
    } catch (error) {
      next(error);
    }
  }

  async getAICommunicationPreferences(req, res, next) {
    try {
      const { companyId } = req.params;
      const prefs = await AiMeganService.getAICommunicationPreferences(req.user.id, companyId);
      res.status(200).json({ data: prefs });
    } catch (error) {
      next(error);
    }
  }

  async updateAICommunicationPreferences(req, res, next) {
    try {
      const { companyId } = req.params;
      // TODO: Validate req.body
      const prefs = await AiMeganService.updateAICommunicationPreferences(req.user.id, companyId, req.body);
      res.status(200).json({ message: 'AI Communication Preferences updated.', data: prefs });
    } catch (error) {
      next(error);
    }
  }

  // Feature Configurations
  async configureAIScreening(req, res, next) {
    try {
      const { jobId } = req.params;
      // TODO: Validate req.body (isEnabled, guidance)
      const config = await AiMeganService.configureAIScreening(req.user.id, jobId, req.body);
      res.status(200).json({ message: 'AI Screening configured.', data: config });
    } catch (error) {
      next(error);
    }
  }
  async getAIScreeningConfig(req, res, next) {
    try {
      const { jobId } = req.params;
      const config = await AiMeganService.getAIScreeningConfig(req.user.id, jobId);
      res.status(200).json({ data: config });
    } catch (error) {
      next(error);
    }
  }


  async configureAIScheduling(req, res, next) {
    try {
      const { jobId } = req.params; // Or meetingId if scheduling is per meeting stage
      const config = await AiMeganService.configureAIScheduling(req.user.id, jobId, req.body);
      res.status(200).json({ message: 'AI Scheduling configured.', data: config });
    } catch (error) {
      next(error);
    }
  }
  async getAISchedulingConfig(req, res, next) {
    try {
      const { jobId } = req.params;
      const config = await AiMeganService.getAISchedulingConfig(req.user.id, jobId);
      res.status(200).json({ data: config });
    } catch (error) {
      next(error);
    }
  }

  async configureAINoteTaking(req, res, next) {
    try {
      const { meetingId } = req.params;
      const config = await AiMeganService.configureAINoteTaking(req.user.id, meetingId, req.body);
      res.status(200).json({ message: 'AI Note Taking configured.', data: config });
    } catch (error) {
      next(error);
    }
  }
  async getAINoteTakingConfig(req, res, next) {
    try {
      const { meetingId } = req.params;
      const config = await AiMeganService.getAINoteTakingConfig(req.user.id, meetingId);
      res.status(200).json({ data: config });
    } catch (error) {
      next(error);
    }
  }

  // Interaction Logging
  async logAIInteraction(req, res, next) { // This might be an internal endpoint or triggered by AI service
    try {
      // TODO: Validate req.body (userId, inputType, input, output)
      // userId might come from req.user if interaction is user-initiated
      const logData = { ...req.body, userId: req.body.userId || req.user?.id };
      const log = await AiMeganService.logAIInteraction(logData);
      res.status(201).json({ message: 'AI interaction logged.', data: log });
    } catch (error) {
      next(error);
    }
  }

  async getAIInteractionLogs(req, res, next) {
    try {
      const logs = await AiMeganService.getAIInteractionLogs(req.user.id, req.query);
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  }
}

export default new AiMeganController();