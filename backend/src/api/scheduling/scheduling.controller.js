import SchedulingService from './scheduling.service.js';

class SchedulingController {
  // Meeting Templates
  async createMeetingTemplate(req, res, next) {
    try {
      const { companyId } = req.params;
      // TODO: Validate req.body
      const template = await SchedulingService.createMeetingTemplate(req.user.id, companyId, req.body);
      res.status(201).json({ message: 'Meeting template created.', data: template });
    } catch (error) {
      next(error);
    }
  }

  async getMeetingTemplatesByCompany(req, res, next) {
    try {
      const { companyId } = req.params;
      const templates = await SchedulingService.getMeetingTemplatesByCompany(req.user.id, companyId);
      res.status(200).json({ data: templates });
    } catch (error) {
      next(error);
    }
  }

  // Meetings
  async scheduleMeeting(req, res, next) {
    try {
      // TODO: Validate req.body (title, startTime, endTime, type, attendees, etc.)
      const meeting = await SchedulingService.scheduleMeeting(req.user.id, req.body);
      res.status(201).json({ message: 'Meeting scheduled.', data: meeting });
    } catch (error) {
      next(error);
    }
  }

  async getMeetingById(req, res, next) {
    try {
      const meeting = await SchedulingService.getMeetingById(req.user.id, req.params.meetingId);
      res.status(200).json({ data: meeting });
    } catch (error) {
      next(error);
    }
  }

  async getMyMeetings(req, res, next) {
    try {
        const meetings = await SchedulingService.getMyMeetings(req.user.id, req.query);
        res.status(200).json(meetings);
    } catch (error) {
        next(error);
    }
  }
}

export default new SchedulingController();