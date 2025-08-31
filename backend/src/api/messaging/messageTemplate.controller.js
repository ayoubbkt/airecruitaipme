import MessageTemplateService from './messageTemplate.service.js';

class MessageTemplateController {
  async getMessageTemplates(req, res, next) {
    try {
      const { companyId } = req.params;
      const templates = await MessageTemplateService.getMessageTemplates(req.user.id, companyId);
      res.status(200).json(templates);
    } catch (error) {
      next(error);
    }
  }

  async getMessageTemplateById(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const template = await MessageTemplateService.getMessageTemplateById(req.user.id, companyId, id);
      res.status(200).json(template);
    } catch (error) {
      next(error);
    }
  }

  async createMessageTemplate(req, res, next) {
    try {
      const { companyId } = req.params;
      const template = await MessageTemplateService.createMessageTemplate(req.user.id, companyId, req.body);
      res.status(201).json({ message: 'Message template created.', data: template });
    } catch (error) {
      next(error);
    }
  }

  async updateMessageTemplate(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const updatedTemplate = await MessageTemplateService.updateMessageTemplate(req.user.id, companyId, id, req.body);
      res.status(200).json({ message: 'Message template updated.', data: updatedTemplate });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessageTemplate(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const result = await MessageTemplateService.deleteMessageTemplate(req.user.id, companyId, id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageTemplateController();