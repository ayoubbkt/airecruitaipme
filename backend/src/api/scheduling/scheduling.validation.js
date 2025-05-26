import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { MeetingType, AttendeeStatus } = pkg;

export const createMeetingSchema = z.object({
  body: z.object({
    title: z.string()
      .min(5, 'Meeting title must be at least 5 characters')
      .max(100, 'Meeting title must not exceed 100 characters')
      .regex(/^[\w\s-]+$/, 'Meeting title contains invalid characters'),
    startTime: z.string()
      .datetime('Invalid start time format')
      .refine(date => new Date(date) > new Date(), 'Start time must be in the future'),
    endTime: z.string()
      .datetime('Invalid end time format'),
    type: z.nativeEnum(MeetingType, {
      errorMap: () => ({ message: 'Invalid meeting type' })
    }),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must not exceed 500 characters')
      .optional(),
    location: z.string()
      .min(5, 'Location must be at least 5 characters')
      .max(200, 'Location must not exceed 200 characters')
      .optional(),
    isOnline: z.boolean(),
    meetingPlatform: z.enum(['ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'OTHER'])
      .optional(),
    meetingLink: z.string()
      .url('Invalid meeting link format')
      .regex(/^https:\/\//, 'Meeting link must use HTTPS')
      .optional()
      .refine(link => {
        if (link && !link) return true;
        return true;
      }, 'Meeting link is required for online meetings'),
    agenda: z.array(
      z.object({
        topic: z.string()
          .min(3, 'Agenda topic must be at least 3 characters')
          .max(100, 'Agenda topic must not exceed 100 characters'),
        duration: z.number()
          .min(1, 'Duration must be at least 1 minute')
          .max(480, 'Duration must not exceed 480 minutes'),
      })
    ).optional(),
    attendees: z.array(
      z.object({
        userId: z.string().uuid('Invalid user ID format'),
        isRequired: z.boolean().default(true),
        role: z.enum(['HOST', 'PRESENTER', 'ATTENDEE']).default('ATTENDEE'),
      })
    )
      .min(1, 'At least one attendee is required')
      .max(50, 'Maximum 50 attendees allowed'),
    reminders: z.array(
      z.object({
        type: z.enum(['EMAIL', 'NOTIFICATION']),
        minutesBefore: z.number().min(5).max(10080), // Max 1 week before
      })
    ).optional(),
  })
  .refine(data => new Date(data.startTime) < new Date(data.endTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  })
  .refine(data => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const durationInHours = (end - start) / (1000 * 60 * 60);
    return durationInHours <= 8;
  }, {
    message: 'Meeting duration cannot exceed 8 hours',
    path: ['endTime'],
  })
  .refine(data => {
    if (data.isOnline && !data.meetingLink) {
      return false;
    }
    return true;
  }, {
    message: 'Meeting link is required for online meetings',
    path: ['meetingLink'],
  }),
});

export const updateMeetingSchema = createMeetingSchema.partial();

export const updateAttendeeStatusSchema = z.object({
  params: z.object({
    meetingId: z.string().min(1, 'Meeting ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(AttendeeStatus),
    message: z.string().optional(),
  }),
});