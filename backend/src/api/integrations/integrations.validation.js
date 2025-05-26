import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { CalendarProvider, IntegrationType } = pkg;

// Common settings schema
const commonSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  autoSync: z.boolean().default(true),
  syncInterval: z.number().min(5).max(1440).optional(), // in minutes
  notifications: z.boolean().default(true),
  errorNotifications: z.boolean().default(true),
});

// Calendar Integration
export const calendarIntegrationSchema = z.object({
  body: z.object({
    type: z.literal(IntegrationType.CALENDAR),
    provider: z.nativeEnum(CalendarProvider),
    accessToken: z.string().min(1, 'Access token is required'),
    refreshToken: z.string().optional(),
    expiresAt: z.string().datetime().optional(),
    settings: z.object({
      ...commonSettingsSchema.shape,
      defaultCalendarId: z.string().optional(),
      defaultMeetingDuration: z.number().min(15).max(180).default(60), // in minutes
      defaultTimeZone: z.string().regex(/^[A-Za-z]+\/[A-Za-z_]+$/).optional(),
      defaultReminderMinutes: z.array(z.number().min(0).max(10080)).optional(), // max 1 week
      workingHours: z.object({
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        daysOfWeek: z.array(z.number().min(0).max(6)),
      }).optional(),
    }).optional(),
  }),
});

// Job Board Integration
export const jobBoardIntegrationSchema = z.object({
  body: z.object({
    type: z.literal(IntegrationType.JOB_BOARD),
    provider: z.string().min(1, 'Provider name is required'),
    apiKey: z.string().min(1, 'API key is required'),
    settings: z.object({
      ...commonSettingsSchema.shape,
      autoPost: z.boolean().default(false),
      categories: z.array(z.string()).max(20).optional(),
      locations: z.array(z.string()).max(50).optional(),
      defaultDuration: z.number().min(1).max(90).default(30), // in days
      budgetLimit: z.number().min(0).optional(),
      postingTemplate: z.object({
        includeCompanyLogo: z.boolean().default(true),
        includeCompanyDescription: z.boolean().default(true),
        includeSalary: z.boolean().default(false),
        includeRemoteOption: z.boolean().default(true),
      }).optional(),
      jobRepostingRules: z.object({
        enabled: z.boolean().default(false),
        minApplications: z.number().min(0).optional(),
        maxReposts: z.number().min(1).max(10).optional(),
        waitDays: z.number().min(1).max(30).optional(),
      }).optional(),
    }).optional(),
  }),
});

// ATS Integration
export const atsIntegrationSchema = z.object({
  body: z.object({
    type: z.literal(IntegrationType.ATS),
    provider: z.string().min(1, 'Provider name is required'),
    apiKey: z.string().min(1, 'API key is required'),
    settings: z.object({
      ...commonSettingsSchema.shape,
      syncFields: z.array(z.string()).min(1, 'At least one field must be selected for sync'),
      syncDirection: z.enum(['import', 'export', 'bidirectional']).default('bidirectional'),
      conflictResolution: z.enum(['keepSource', 'keepTarget', 'newest', 'manual']).default('manual'),
      customFieldMappings: z.record(z.string(), z.string()).optional(),
    }).optional(),
  }),
});