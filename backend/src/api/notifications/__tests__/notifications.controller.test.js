import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../app.js';
import { prismaMock } from '../../../../jest.setup.js';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus
} from '../../../generated/prisma/index.js';

describe('Notifications Tests', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com'
  };

  describe('POST /api/notifications', () => {
    const validNotification = {
      type: NotificationType.INTERVIEW_SCHEDULED,
      title: 'Interview Scheduled',
      message: 'Your interview has been scheduled for tomorrow',
      recipientId: 'user-2',
      recipientType: 'USER',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
      channelSettings: {
        email: {
          enabled: true,
          template: 'interview-scheduled',
          cc: ['manager@example.com']
        },
        push: {
          enabled: true,
          sound: true
        }
      },
      data: {
        interviewId: 'interview-1',
        entityType: 'INTERVIEW',
        actionUrl: 'https://example.com/interviews/1'
      },
      actionButtons: [
        {
          label: 'View Details',
          action: 'VIEW_INTERVIEW',
          style: 'PRIMARY'
        }
      ]
    };

    it('should create notification successfully', async () => {
      const mockCreatedNotification = {
        id: 'notif-1',
        ...validNotification,
        status: NotificationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.notification.create.mockResolvedValue(mockCreatedNotification);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/notifications')
        .send(validNotification);

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe(NotificationType.INTERVIEW_SCHEDULED);
    });

    it('should validate notification fields', async () => {
      const invalidNotification = {
        ...validNotification,
        title: '', // Empty title
        message: 'a'.repeat(2500), // Message too long
        channels: [], // Empty channels
        actionButtons: Array(5).fill({ label: 'Test', action: 'TEST' }) // Too many buttons
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(invalidNotification);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should handle scheduled notifications', async () => {
      const scheduledNotification = {
        ...validNotification,
        schedule: {
          sendAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          repeat: 'DAILY',
          timezone: 'America/New_York'
        }
      };

      const mockCreatedNotification = {
        id: 'notif-2',
        ...scheduledNotification,
        status: NotificationStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.notification.create.mockResolvedValue(mockCreatedNotification);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/notifications')
        .send(scheduledNotification);

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe(NotificationStatus.SCHEDULED);
    });
  });

  describe('GET /api/notifications', () => {
    it('should get notifications with filters', async () => {
      const mockNotifications = Array(5).fill(null).map((_, i) => ({
        id: `notif-${i}`,
        type: NotificationType.INTERVIEW_SCHEDULED,
        title: `Notification ${i}`,
        recipientId: mockUser.id,
        status: NotificationStatus.SENT,
        createdAt: new Date()
      }));

      prismaMock.notification.findMany.mockResolvedValue(mockNotifications);
      prismaMock.notification.count.mockResolvedValue(mockNotifications.length);

      const response = await request(app)
        .get('/api/notifications')
        .query({
          type: NotificationType.INTERVIEW_SCHEDULED,
          status: NotificationStatus.SENT,
          read: false,
          priority: NotificationPriority.HIGH
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
    });

    it('should paginate results', async () => {
      prismaMock.notification.findMany.mockResolvedValue([]);
      prismaMock.notification.count.mockResolvedValue(100);

      const response = await request(app)
        .get('/api/notifications')
        .query({ page: '2', limit: '20' });

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalPages).toBe(5);
    });
  });

  describe('PUT /api/notifications/:id', () => {
    it('should update notification status', async () => {
      const updateData = {
        status: NotificationStatus.READ,
        read: true
      };

      prismaMock.notification.update.mockResolvedValue({
        id: 'notif-1',
        ...updateData,
        updatedAt: new Date()
      });

      const response = await request(app)
        .put('/api/notifications/notif-1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(NotificationStatus.READ);
    });

    it('should handle snoozing notifications', async () => {
      const updateData = {
        snoozeUntil: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      };

      prismaMock.notification.update.mockResolvedValue({
        id: 'notif-1',
        status: NotificationStatus.SNOOZED,
        ...updateData,
        updatedAt: new Date()
      });

      const response = await request(app)
        .put('/api/notifications/notif-1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(NotificationStatus.SNOOZED);
    });
  });

  describe('POST /api/notifications/batch', () => {
    it('should perform batch operations', async () => {
      const batchData = {
        notificationIds: ['notif-1', 'notif-2', 'notif-3'],
        action: 'MARK_READ'
      };

      prismaMock.notification.updateMany.mockResolvedValue({ count: 3 });

      const response = await request(app)
        .post('/api/notifications/batch')
        .send(batchData);

      expect(response.status).toBe(200);
      expect(response.body.data.updated).toBe(3);
    });
  });

  describe('PUT /api/notifications/preferences', () => {
    it('should update notification preferences', async () => {
      const preferences = {
        channelPreferences: {
          [NotificationChannel.EMAIL]: true,
          [NotificationChannel.PUSH]: true,
          [NotificationChannel.SMS]: false
        },
        typePreferences: {
          [NotificationType.INTERVIEW_SCHEDULED]: {
            enabled: true,
            channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
            priority: NotificationPriority.HIGH
          }
        },
        schedulePreferences: {
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          timezone: 'Europe/London'
        }
      };

      prismaMock.userNotificationPreferences.upsert.mockResolvedValue({
        userId: mockUser.id,
        ...preferences,
        updatedAt: new Date()
      });

      const response = await request(app)
        .put('/api/notifications/preferences')
        .send(preferences);

      expect(response.status).toBe(200);
      expect(response.body.data.channelPreferences).toBeDefined();
      expect(response.body.data.typePreferences).toBeDefined();
      expect(response.body.data.schedulePreferences).toBeDefined();
    });

    it('should validate preference settings', async () => {
      const invalidPreferences = {
        channelPreferences: {
          INVALID_CHANNEL: true
        },
        schedulePreferences: {
          quietHoursStart: '25:00' // Invalid time
        }
      };

      const response = await request(app)
        .put('/api/notifications/preferences')
        .send(invalidPreferences);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });
});
