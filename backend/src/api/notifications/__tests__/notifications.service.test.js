import prisma from '../../../config/db.js';
import NotificationService from '../notifications.service.js';
import { NotificationType, NotificationChannel, NotificationPriority, NotificationStatus } from '../../../generated/prisma/index.js';

// Mock prisma
jest.mock('../../../config/db.js');

describe('NotificationService', () => {
  let service;
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    service = new NotificationService();
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    const validNotification = {
      type: NotificationType.INTERVIEW_SCHEDULED,
      title: 'Interview Scheduled',
      message: 'Your interview has been scheduled',
      recipientId: 'user-2',
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
      priority: NotificationPriority.HIGH
    };

    it('should create a notification', async () => {
      prisma.notification.create.mockResolvedValue({
        id: 'notif-1',
        ...validNotification,
        status: NotificationStatus.PENDING,
        createdAt: new Date()
      });

      prisma.user.findUnique.mockResolvedValue({
        id: validNotification.recipientId
      });

      const result = await service.createNotification(validNotification);
      
      expect(result).toBeDefined();
      expect(result.type).toBe(NotificationType.INTERVIEW_SCHEDULED);
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should handle scheduled notifications', async () => {
      const scheduledNotification = {
        ...validNotification,
        schedule: {
          sendAt: new Date(Date.now() + 86400000),
          repeat: 'DAILY',
          timezone: 'America/New_York'
        }
      };

      prisma.notification.create.mockResolvedValue({
        id: 'notif-2',
        ...scheduledNotification,
        status: NotificationStatus.SCHEDULED,
        createdAt: new Date()
      });

      prisma.user.findUnique.mockResolvedValue({
        id: validNotification.recipientId
      });

      const result = await service.createNotification(scheduledNotification);
      
      expect(result.status).toBe(NotificationStatus.SCHEDULED);
    });

    it('should validate recipient existence', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createNotification(validNotification)
      ).rejects.toThrow('Recipient not found');
    });
  });

  describe('getNotifications', () => {
    it('should get notifications with filters', async () => {
      const filters = {
        type: NotificationType.INTERVIEW_SCHEDULED,
        status: NotificationStatus.SENT,
        priority: NotificationPriority.HIGH
      };

      const mockNotifications = Array(5).fill(null).map((_, i) => ({
        id: `notif-${i}`,
        ...filters,
        createdAt: new Date()
      }));

      prisma.notification.findMany.mockResolvedValue(mockNotifications);
      prisma.notification.count.mockResolvedValue(mockNotifications.length);

      const result = await service.getNotifications('user-1', filters);
      
      expect(result.notifications).toHaveLength(5);
      expect(result.total).toBe(5);
    });

    it('should handle date range filters', async () => {
      const dateFilters = {
        fromDate: new Date(Date.now() - 86400000),
        toDate: new Date()
      };

      await service.getNotifications('user-1', dateFilters);
      
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object)
          })
        })
      );
    });
  });

  describe('updateNotification', () => {
    const mockNotification = {
      id: 'notif-1',
      recipientId: 'user-1',
      status: NotificationStatus.SENT
    };

    it('should update notification status', async () => {
      const updateData = {
        status: NotificationStatus.READ,
        read: true
      };

      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.update.mockResolvedValue({
        ...mockNotification,
        ...updateData,
        updatedAt: new Date()
      });

      const result = await service.updateNotification('notif-1', 'user-1', updateData);
      
      expect(result.status).toBe(NotificationStatus.READ);
    });

    it('should prevent unauthorized updates', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        ...mockNotification,
        recipientId: 'other-user'
      });

      await expect(
        service.updateNotification('notif-1', 'user-1', { read: true })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateNotificationPreferences', () => {
    const validPreferences = {
      channelPreferences: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.PUSH]: true
      },
      typePreferences: {
        [NotificationType.INTERVIEW_SCHEDULED]: {
          enabled: true,
          channels: [NotificationChannel.EMAIL]
        }
      },
      schedulePreferences: {
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      }
    };

    it('should update user preferences', async () => {
      prisma.userNotificationPreferences.upsert.mockResolvedValue({
        userId: 'user-1',
        ...validPreferences,
        updatedAt: new Date()
      });

      const result = await service.updateNotificationPreferences('user-1', validPreferences);
      
      expect(result.channelPreferences).toBeDefined();
      expect(result.typePreferences).toBeDefined();
      expect(result.schedulePreferences).toBeDefined();
    });
  });

  describe('processNotification', () => {
    const mockNotification = {
      id: 'notif-1',
      type: NotificationType.INTERVIEW_SCHEDULED,
      channels: [NotificationChannel.EMAIL],
      recipientId: 'user-2',
      status: NotificationStatus.PENDING
    };

    it('should process notification through channels', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.update.mockResolvedValue({
        ...mockNotification,
        status: NotificationStatus.SENT,
        processedAt: new Date()
      });

      const result = await service.processNotification('notif-1');
      
      expect(result.status).toBe(NotificationStatus.SENT);
      expect(result.processedAt).toBeDefined();
    });

    it('should handle processing errors', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.update.mockRejectedValue(new Error('Processing failed'));

      await expect(
        service.processNotification('notif-1')
      ).rejects.toThrow('Processing failed');
    });
  });
});
