import MessagingService from './messaging.service.js';

class MessagingController {
  async sendMessage(req, res, next) {
    try {
      const { applicationId } = req.params;
      // TODO: Validate req.body (content, isInternalNote, visibility, attachments)
      const message = await MessagingService.sendMessage(req.user.id, applicationId, req.body);
      res.status(201).json({ message: 'Message sent.', data: message });
    } catch (error) {
      next(error);
    }
  }

  async getMessagesForApplication(req, res, next) {
    try {
      const { applicationId } = req.params;
      const messages = await MessagingService.getMessagesForApplication(req.user.id, applicationId, req.query);
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  }
}

export default new MessagingController();