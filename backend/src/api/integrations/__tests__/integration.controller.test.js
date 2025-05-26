import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../app.js';
import { prismaMock } from '../../../../jest.setup.js';
import { CalendarProvider, IntegrationType } from '../../../../generated/prisma/index.js';

describe('Integrations Tests', () => {
  describe('POST /api/integrations/calendar', () => {
    const validCalendarIntegration = {
      type: IntegrationType.CALENDAR,
      provider: CalendarProvider.GOOGLE,
      accessToken: 'valid-access-token',
      refreshToken: 'valid-refresh-token',
      expiresAt: new Date().toISOString(),
      settings: {
        enabled: true,
        autoSync: true,
        defaultCalendarId: 'primary',
        defaultMeetingDuration: 60,
        defaultTimeZone: 'America/New_York',
        workingHours: {
          start: '09:00',
          end: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5]
        }
      }
    };

    it('should create a calendar integration successfully', async () => {
      prismaMock.integration.create.mockResolvedValue({
        id: '1',
        ...validCalendarIntegration,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/api/integrations/calendar')
        .send(validCalendarIntegration);

      expect(response.status).toBe(201);
      expect(response.body.data.provider).toBe(CalendarProvider.GOOGLE);
    });

    it('should validate calendar integration settings', async () => {
      const invalidIntegration = {
        type: IntegrationType.CALENDAR,
        provider: 'INVALID_PROVIDER',
        settings: {
          defaultMeetingDuration: 0, // Invalid duration
          workingHours: {
            start: 'invalid-time',
            end: '25:00', // Invalid time
            daysOfWeek: [7] // Invalid day
          }
        }
      };

      const response = await request(app)
        .post('/api/integrations/calendar')
        .send(invalidIntegration);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('POST /api/integrations/job-board', () => {
    const validJobBoardIntegration = {
      type: IntegrationType.JOB_BOARD,
      provider: 'linkedin',
      apiKey: 'valid-api-key',
      settings: {
        enabled: true,
        autoPost: true,
        categories: ['engineering', 'design'],
        locations: ['remote', 'new-york'],
        defaultDuration: 30,
        budgetLimit: 1000,
        postingTemplate: {
          includeCompanyLogo: true,
          includeSalary: false
        },
        jobRepostingRules: {
          enabled: true,
          minApplications: 10,
          maxReposts: 3,
          waitDays: 7
        }
      }
    };

    it('should create a job board integration successfully', async () => {
      prismaMock.integration.create.mockResolvedValue({
        id: '1',
        ...validJobBoardIntegration,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/api/integrations/job-board')
        .send(validJobBoardIntegration);

      expect(response.status).toBe(201);
      expect(response.body.data.provider).toBe('linkedin');
    });

    it('should validate job board settings', async () => {
      const invalidIntegration = {
        type: IntegrationType.JOB_BOARD,
        provider: '', // Empty provider
        settings: {
          categories: Array(25).fill('category'), // Too many categories
          defaultDuration: 100, // Exceeds max duration
          jobRepostingRules: {
            maxReposts: 20 // Exceeds max reposts
          }
        }
      };

      const response = await request(app)
        .post('/api/integrations/job-board')
        .send(invalidIntegration);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('POST /api/integrations/ats', () => {
    const validAtsIntegration = {
      type: IntegrationType.ATS,
      provider: 'workday',
      apiKey: 'valid-api-key',
      settings: {
        enabled: true,
        autoSync: true,
        syncFields: ['name', 'email', 'status'],
        syncDirection: 'bidirectional',
        conflictResolution: 'newest',
        customFieldMappings: {
          'custom_field_1': 'mapped_field_1'
        }
      }
    };

    it('should create an ATS integration successfully', async () => {
      prismaMock.integration.create.mockResolvedValue({
        id: '1',
        ...validAtsIntegration,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/api/integrations/ats')
        .send(validAtsIntegration);

      expect(response.status).toBe(201);
      expect(response.body.data.provider).toBe('workday');
    });

    it('should validate ATS settings', async () => {
      const invalidIntegration = {
        type: IntegrationType.ATS,
        provider: '', // Empty provider
        settings: {
          syncFields: [], // Empty sync fields
          syncDirection: 'invalid', // Invalid direction
          conflictResolution: 'unknown' // Invalid resolution
        }
      };

      const response = await request(app)
        .post('/api/integrations/ats')
        .send(invalidIntegration);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('PUT /api/integrations/:id', () => {
    it('should update integration settings', async () => {
      const updateData = {
        settings: {
          enabled: false,
          autoSync: false
        }
      };

      prismaMock.integration.update.mockResolvedValue({
        id: '1',
        ...validCalendarIntegration,
        ...updateData,
        updatedAt: new Date()
      });

      const response = await request(app)
        .put('/api/integrations/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.settings.enabled).toBe(false);
    });
  });

  describe('DELETE /api/integrations/:id', () => {
    it('should delete an integration', async () => {
      prismaMock.integration.delete.mockResolvedValue({
        id: '1'
      });

      const response = await request(app)
        .delete('/api/integrations/1');

      expect(response.status).toBe(204);
    });
  });
});
