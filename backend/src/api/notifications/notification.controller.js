import NotificationService from './notification.service.js';

class NotificationController {
  async getMyNotifications(req, res, next) {
    try {
      const notifications = await NotificationService.getMyNotifications(req.user.id, req.query);
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markNotificationAsRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      const notification = await NotificationService.markNotificationAsRead(req.user.id, notificationId);
      res.status(200).json({ message: 'Notification marked as read.', data: notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllMyNotificationsAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllMyNotificationsAsRead(req.user.id);
      res.status(200).json({ message: `${result.count} notifications marked as read.` });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();