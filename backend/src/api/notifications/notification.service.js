import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
const { NotificationType } = pkg;
class NotificationService {
  // This service would typically be called by other services, not directly via API for creation.
  async createNotification(notificationData) {
    const { userId, type, message, link } = notificationData;

    if (!userId || !type || !message) {
      throw new Error('userId, type, and message are required for a notification.');
    }
    if (!Object.values(NotificationType).includes(type)) {
        throw new Error(`Invalid notification type: ${type}`);
    }

    return prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link,
      }
    });
  }

  async getMyNotifications(userId, queryParams) {
    const { page = 1, limit = 10, unreadOnly = false } = queryParams;
    const skip = (page - 1) * limit;

    const whereClause = { userId };
    if (unreadOnly === 'true' || unreadOnly === true) {
      whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    const totalNotifications = await prisma.notification.count({ where: whereClause });
    const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } });


    return {
        data: notifications,
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
        unreadCount
    };
  }

  async markNotificationAsRead(userId, notificationId) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification) {
      const error = new Error('Notification not found.');
      error.statusCode = 404;
      throw error;
    }
    if (notification.userId !== userId) {
      const error = new Error('Forbidden: You can only mark your own notifications as read.');
      error.statusCode = 403;
      throw error;
    }
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  async markAllMyNotificationsAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}

// Example of how another service might use NotificationService:
// In JobService, after a new application:
// import NotificationService from '../notifications/notification.service.js';
// ...
// await NotificationService.createNotification({
//   userId: hiringManagerId, // ID of user to notify
//   type: NotificationType.NEW_CANDIDATE,
//   message: `New candidate ${candidate.name} applied for ${job.title}.`,
//   link: `/applications/${application.id}` // Link to the application
// });

export default new NotificationService();