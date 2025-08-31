import { jest } from '@jest/globals';
import { prismaMock } from '../../../../jest.setup.js';
import * as schedulingService from '../scheduling.service.js';
import AppError from '../../../utils/AppError.js';

describe('Scheduling Service', () => {
  const validMeeting = {
    title: 'Technical Interview - Senior Developer Position',
    startTime: '2025-06-01T10:00:00Z',
    endTime: '2025-06-01T11:00:00Z',
    type: 'INTERVIEW',
    description: 'Technical interview for senior developer position',
    isOnline: true,
    meetingPlatform: 'GOOGLE_MEET',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    agenda: [
      {
        topic: 'Introduction',
        duration: 5
      },
      {
        topic: 'Technical Discussion',
        duration: 45
      },
      {
        topic: 'Q&A',
        duration: 10
      }
    ],
    attendees: [
      {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        isRequired: true,
        role: 'HOST'
      },
      {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        isRequired: true,
        role: 'ATTENDEE'
      }
    ],
    reminders: [
      {
        type: 'EMAIL',
        minutesBefore: 60
      },
      {
        type: 'NOTIFICATION',
        minutesBefore: 15
      }
    ]
  };

  describe('createMeeting', () => {
    it('should create meeting successfully with all details', async () => {
      const mockMeeting = {
        id: '1',
        ...validMeeting,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.meeting.create.mockResolvedValue(mockMeeting);
      prismaMock.user.findMany.mockResolvedValue([
        { id: validMeeting.attendees[0].userId },
        { id: validMeeting.attendees[1].userId }
      ]);

      const result = await schedulingService.createMeeting(validMeeting);

      expect(result).toEqual(mockMeeting);
      expect(prismaMock.meeting.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: validMeeting.title,
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          attendees: {
            create: expect.arrayContaining([
              expect.objectContaining({
                userId: validMeeting.attendees[0].userId
              })
            ])
          }
        })
      });
    });

    it('should throw error for invalid attendee', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: validMeeting.attendees[0].userId }
      ]); // One attendee not found

      await expect(schedulingService.createMeeting(validMeeting))
        .rejects.toThrow(AppError);
    });

    it('should throw error for overlapping meetings', async () => {
      const existingMeeting = {
        id: '2',
        startTime: new Date('2025-06-01T10:30:00Z'),
        endTime: new Date('2025-06-01T11:30:00Z')
      };

      prismaMock.user.findMany.mockResolvedValue([
        { id: validMeeting.attendees[0].userId },
        { id: validMeeting.attendees[1].userId }
      ]);
      prismaMock.meeting.findMany.mockResolvedValue([existingMeeting]);

      await expect(schedulingService.createMeeting(validMeeting))
        .rejects.toThrow(/scheduling conflict/i);
    });
  });

  describe('updateMeetingStatus', () => {
    it('should update attendee status successfully', async () => {
      const mockAttendee = {
        id: '1',
        meetingId: '123',
        userId: validMeeting.attendees[1].userId,
        status: 'ACCEPTED',
        message: 'I will attend'
      };

      prismaMock.meetingAttendee.findFirst.mockResolvedValue(mockAttendee);
      prismaMock.meetingAttendee.update.mockResolvedValue({
        ...mockAttendee,
        status: 'ACCEPTED'
      });

      const result = await schedulingService.updateAttendeeStatus(
        '123',
        validMeeting.attendees[1].userId,
        { status: 'ACCEPTED', message: 'I will attend' }
      );

      expect(result.status).toBe('ACCEPTED');
    });

    it('should throw error when updating status for non-existent attendee', async () => {
      prismaMock.meetingAttendee.findFirst.mockResolvedValue(null);

      await expect(schedulingService.updateAttendeeStatus(
        '123',
        'nonexistent-user',
        { status: 'ACCEPTED' }
      )).rejects.toThrow(AppError);
    });
  });

  describe('getMeetingsByDateRange', () => {
    it('should return meetings within date range', async () => {
      const startDate = new Date('2025-06-01T00:00:00Z');
      const endDate = new Date('2025-06-07T23:59:59Z');
      const mockMeetings = [
        {
          id: '1',
          title: 'Meeting 1',
          startTime: new Date('2025-06-02T10:00:00Z')
        },
        {
          id: '2',
          title: 'Meeting 2',
          startTime: new Date('2025-06-03T14:00:00Z')
        }
      ];

      prismaMock.meeting.findMany.mockResolvedValue(mockMeetings);

      const result = await schedulingService.getMeetingsByDateRange(
        startDate,
        endDate,
        validMeeting.attendees[0].userId
      );

      expect(result).toEqual(mockMeetings);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no meetings found', async () => {
      prismaMock.meeting.findMany.mockResolvedValue([]);

      const result = await schedulingService.getMeetingsByDateRange(
        new Date('2025-06-01T00:00:00Z'),
        new Date('2025-06-07T23:59:59Z'),
        validMeeting.attendees[0].userId
      );

      expect(result).toEqual([]);
    });
  });

  describe('cancelMeeting', () => {
    it('should cancel meeting successfully', async () => {
      const mockMeeting = {
        id: '1',
        ...validMeeting,
        status: 'SCHEDULED'
      };

      prismaMock.meeting.findUnique.mockResolvedValue(mockMeeting);
      prismaMock.meeting.update.mockResolvedValue({
        ...mockMeeting,
        status: 'CANCELLED'
      });

      const result = await schedulingService.cancelMeeting('1', {
        reason: 'Schedule conflict',
        cancelledBy: validMeeting.attendees[0].userId
      });

      expect(result.status).toBe('CANCELLED');
    });

    it('should throw error when cancelling non-existent meeting', async () => {
      prismaMock.meeting.findUnique.mockResolvedValue(null);

      await expect(schedulingService.cancelMeeting('999', {
        reason: 'Schedule conflict',
        cancelledBy: validMeeting.attendees[0].userId
      })).rejects.toThrow(AppError);
    });
  });

  describe('rescheduleMeeting', () => {
    it('should reschedule meeting successfully', async () => {
      const mockMeeting = {
        id: '1',
        ...validMeeting,
        status: 'SCHEDULED'
      };

      const newStartTime = '2025-06-02T10:00:00Z';
      const newEndTime = '2025-06-02T11:00:00Z';

      prismaMock.meeting.findUnique.mockResolvedValue(mockMeeting);
      prismaMock.meeting.update.mockResolvedValue({
        ...mockMeeting,
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime)
      });

      const result = await schedulingService.rescheduleMeeting('1', {
        startTime: newStartTime,
        endTime: newEndTime,
        reason: 'Better timing for all attendees'
      });

      expect(result.startTime).toEqual(new Date(newStartTime));
      expect(result.endTime).toEqual(new Date(newEndTime));
    });

    it('should throw error when rescheduling to invalid time range', async () => {
      const mockMeeting = {
        id: '1',
        ...validMeeting
      };

      prismaMock.meeting.findUnique.mockResolvedValue(mockMeeting);

      await expect(schedulingService.rescheduleMeeting('1', {
        startTime: '2025-06-02T11:00:00Z',
        endTime: '2025-06-02T10:00:00Z', // End time before start time
        reason: 'Invalid time range'
      })).rejects.toThrow(/invalid time range/i);
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available time slots for all attendees', async () => {
      const startDate = new Date('2025-06-01T00:00:00Z');
      const endDate = new Date('2025-06-01T23:59:59Z');
      const duration = 60; // minutes

      const mockMeetings = [
        {
          startTime: new Date('2025-06-01T10:00:00Z'),
          endTime: new Date('2025-06-01T11:00:00Z')
        }
      ];

      prismaMock.meeting.findMany.mockResolvedValue(mockMeetings);

      const slots = await schedulingService.getAvailableSlots(
        startDate,
        endDate,
        duration,
        validMeeting.attendees.map(a => a.userId)
      );

      expect(slots).toBeInstanceOf(Array);
      expect(slots.length).toBeGreaterThan(0);
      slots.forEach(slot => {
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        // Verify slots don't overlap with existing meetings
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);
        mockMeetings.forEach(meeting => {
          const overlap = slotStart < meeting.endTime && slotEnd > meeting.startTime;
          expect(overlap).toBeFalsy();
        });
      });
    });

    it('should handle working hours and time zones', async () => {
      const startDate = new Date('2025-06-01T00:00:00Z');
      const endDate = new Date('2025-06-01T23:59:59Z');
      const duration = 60;
      const workingHours = {
        start: '09:00',
        end: '17:00',
        timezone: 'Europe/Paris'
      };

      prismaMock.meeting.findMany.mockResolvedValue([]);
      prismaMock.user.findMany.mockResolvedValue([
        { id: validMeeting.attendees[0].userId, timezone: 'Europe/Paris' },
        { id: validMeeting.attendees[1].userId, timezone: 'Europe/London' }
      ]);

      const slots = await schedulingService.getAvailableSlots(
        startDate,
        endDate,
        duration,
        validMeeting.attendees.map(a => a.userId),
        workingHours
      );

      expect(slots).toBeInstanceOf(Array);
      slots.forEach(slot => {
        const slotTime = new Date(slot.startTime);
        const slotHour = slotTime.getUTCHours();
        // Considering timezone offsets, slots should be within working hours
        expect(slotHour).toBeGreaterThanOrEqual(7); // 09:00 Paris time in UTC
        expect(slotHour).toBeLessThanOrEqual(15); // 17:00 Paris time in UTC
      });
    });
  });

  describe('getMeetingStatistics', () => {
    it('should return meeting statistics for a date range', async () => {
      const startDate = new Date('2025-06-01T00:00:00Z');
      const endDate = new Date('2025-06-07T23:59:59Z');
      const mockMeetings = [
        {
          type: 'INTERVIEW',
          status: 'COMPLETED',
          duration: 60
        },
        {
          type: 'INTERVIEW',
          status: 'CANCELLED',
          duration: 45
        },
        {
          type: 'TEAM_MEETING',
          status: 'COMPLETED',
          duration: 30
        }
      ];

      prismaMock.meeting.findMany.mockResolvedValue(mockMeetings);
      prismaMock.meeting.groupBy.mockResolvedValue([
        { type: 'INTERVIEW', _count: 2 },
        { type: 'TEAM_MEETING', _count: 1 }
      ]);

      const stats = await schedulingService.getMeetingStatistics(startDate, endDate);

      expect(stats).toEqual(expect.objectContaining({
        totalMeetings: 3,
        completedMeetings: 2,
        cancelledMeetings: 1,
        averageDuration: 45,
        typeBreakdown: expect.objectContaining({
          INTERVIEW: 2,
          TEAM_MEETING: 1
        })
      }));
    });
  });
});
