import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { NotificationType, NotificationChannel, NotificationPriority, NotificationStatus } = pkg;

const notificationDataSchema = z.object({
  entityId: z.string().optional(),
  entityType: z.string().optional(),
  actionUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

const scheduleSchema = z.object({
  sendAt: z.string().datetime(),
  repeat: z.enum(['NEVER', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  repeatUntil: z.string().datetime().optional(),
  timezone: z.string().regex(/^[A-Za-z]+\/[A-Za-z_]+$/).optional(),
});

const channelSettingsSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    template: z.string().optional(),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
  }).optional(),
  push: z.object({
    enabled: z.boolean(),
    sound: z.boolean().optional(),
    badge: z.boolean().optional(),
    icon: z.string().optional(),
  }).optional(),
  sms: z.object({
    enabled: z.boolean(),
    priority: z.boolean().optional(),
  }).optional(),
  slack: z.object({
    enabled: z.boolean(),
    channel: z.string().optional(),
  }).optional(),
});

export const createNotificationSchema = z.object({
  body: z.object({
    type: z.nativeEnum(NotificationType),
    title: z.string().min(1, 'Notification title is required').max(200, 'Title too long'),
    message: z.string().min(1, 'Notification message is required').max(2000, 'Message too long'),
    recipientId: z.string().min(1, 'Recipient ID is required'),
    recipientType: z.enum(['USER', 'GROUP', 'ALL']).default('USER'),
    data: notificationDataSchema.optional(),
    priority: z.nativeEnum(NotificationPriority).default('NORMAL'),
    channels: z.array(z.nativeEnum(NotificationChannel)).min(1, 'At least one channel required'),
    channelSettings: channelSettingsSchema.optional(),
    schedule: scheduleSchema.optional(),
    expiresAt: z.string().datetime().optional(),
    category: z.string().max(50).optional(),
    tags: z.array(z.string()).max(10).optional(),
    requiredAction: z.boolean().default(false),
    actionButtons: z.array(z.object({
      label: z.string().max(50),
      action: z.string().max(50),
      style: z.enum(['PRIMARY', 'SECONDARY', 'DANGER']).optional(),
    })).max(3).optional(),
  }),
});

export const updateNotificationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Notification ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(NotificationStatus).optional(),
    read: z.boolean().optional(),
    archived: z.boolean().optional(),
    actionTaken: z.string().optional(),
    snoozeUntil: z.string().datetime().optional(),
  }),
});

export const getNotificationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    type: z.nativeEnum(NotificationType).optional(),
    status: z.nativeEnum(NotificationStatus).optional(),
    priority: z.nativeEnum(NotificationPriority).optional(),
    read: z.string().transform(val => val === 'true').optional(),
    archived: z.string().transform(val => val === 'true').optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    search: z.string().optional(),
  }),
});

export const batchUpdateSchema = z.object({
  body: z.object({
    notificationIds: z.array(z.string()).min(1, 'At least one notification ID required'),
    action: z.enum(['MARK_READ', 'MARK_UNREAD', 'ARCHIVE', 'UNARCHIVE', 'DELETE']),
  }),
});

export const notificationPreferencesSchema = z.object({
  body: z.object({
    channelPreferences: z.record(z.nativeEnum(NotificationChannel), z.boolean()),
    typePreferences: z.record(z.nativeEnum(NotificationType), z.object({
      enabled: z.boolean(),
      channels: z.array(z.nativeEnum(NotificationChannel)).optional(),
      priority: z.nativeEnum(NotificationPriority).optional(),
    })),
    schedulePreferences: z.object({
      quietHoursEnabled: z.boolean().optional(),
      quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      timezone: z.string().regex(/^[A-Za-z]+\/[A-Za-z_]+$/).optional(),
    }).optional(),
  }),
});