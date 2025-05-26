import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../app.js';
import { prismaMock } from '../../../../jest.setup.js';

describe('Scheduling Controller Integration Tests', () => {
  describe('POST /api/meetings', () => {
    it('should create a new meeting', async () => {
      const mockMeeting = {
        id: '1',
        title: 'Technical Interview',
        startTime: '2025-06-01T10:00:00Z',
        endTime: '2025-06-01T11:00:00Z',
        type: 'INTERVIEW',
        description: 'Technical interview for software developer position',
        location: 'Room 101',
        isOnline: true,
        meetingLink: 'https://meet.google.com/abc-xyz',
        attendees: [
          {
            userId: '123',
            isRequired: true,
            status: 'PENDING'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.meeting.create.mockResolvedValue(mockMeeting);
      prismaMock.meetingAttendee.createMany.mockResolvedValue({ count: 1 });

      const response = await request(app)
        .post('/api/meetings')
        .send({
          title: 'Technical Interview',
          startTime: '2025-06-01T10:00:00Z',
          endTime: '2025-06-01T11:00:00Z',
          type: 'INTERVIEW',
          description: 'Technical interview for software developer position',
          location: 'Room 101',
          isOnline: true,
          meetingLink: 'https://meet.google.com/abc-xyz',
          attendees: [
            {
              userId: '123',
              isRequired: true
            }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(expect.objectContaining({
        title: 'Technical Interview',
        type: 'INTERVIEW'
      }));
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/meetings')
        .send({
          title: 'Invalid Meeting',
          startTime: '2025-06-01T11:00:00Z',
          endTime: '2025-06-01T10:00:00Z', // End time before start time
          type: 'INTERVIEW',
          attendees: []
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/meetings/:meetingId/attendees/status', () => {
    it('should update attendee status', async () => {
      const mockAttendee = {
        id: '1',
        meetingId: '123',
        userId: '456',
        status: 'ACCEPTED',
        message: 'I will attend'
      };

      prismaMock.meetingAttendee.update.mockResolvedValue(mockAttendee);

      const response = await request(app)
        .patch('/api/meetings/123/attendees/status')
        .send({
          status: 'ACCEPTED',
          message: 'I will attend'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockAttendee);
    });
  });

  describe('GET /api/meetings', () => {
    it('should return user meetings', async () => {
      const mockMeetings = [
        {
          id: '1',
          title: 'Technical Interview',
          startTime: '2025-06-01T10:00:00Z'
        },
        {
          id: '2',
          title: 'HR Interview',
          startTime: '2025-06-02T14:00:00Z'
        }
      ];

      prismaMock.meeting.findMany.mockResolvedValue(mockMeetings);

      const response = await request(app)
        .get('/api/meetings')
        .query({ userId: '123' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toEqual(expect.objectContaining({
        title: 'Technical Interview'
      }));
    });

    it('should handle pagination', async () => {
      const mockMeetings = [
        {
          id: '1',
          title: 'Technical Interview'
        }
      ];

      prismaMock.meeting.findMany.mockResolvedValue(mockMeetings);
      prismaMock.meeting.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/meetings')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalItems).toBe(1);
    });
  });
});
