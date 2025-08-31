import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../app.js';
import { prismaMock } from '../../../../jest.setup.js';

describe('AIMegan Controller Integration Tests', () => {
  describe('POST /api/ai-megan/configure', () => {
    it('should validate request payload', async () => {
      const response = await request(app)
        .post('/api/ai-megan/configure')
        .send({
          companyId: '', // Invalid empty company ID
          aiScreeningConfig: {
            enabled: true,
            customQuestions: Array(11).fill('Question'), // Exceeds max 10 questions
            minimumScore: 150 // Exceeds max 100
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should configure AI Megan successfully', async () => {
      const mockConfig = {
        id: '1',
        companyId: '123',
        aiScreeningConfig: {
          enabled: true,
          customQuestions: ['What is your experience?'],
          skillsToAssess: ['JavaScript', 'React'],
          minimumScore: 70
        },
        aiSchedulingConfig: {
          enabled: true,
          availabilityWindow: 7,
          reminderEnabled: true,
          reminderHours: 24
        },
        tone: 'PROFESSIONAL',
        language: 'en'
      };

      prismaMock.aIMeganConfig.upsert.mockResolvedValue(mockConfig);

      const response = await request(app)
        .post('/api/ai-megan/configure')
        .send({
          companyId: '123',
          aiScreeningConfig: {
            enabled: true,
            customQuestions: ['What is your experience?'],
            skillsToAssess: ['JavaScript', 'React'],
            minimumScore: 70
          },
          aiSchedulingConfig: {
            enabled: true,
            availabilityWindow: 7,
            reminderEnabled: true,
            reminderHours: 24
          },
          tone: 'PROFESSIONAL',
          language: 'en'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(expect.objectContaining({
        companyId: '123',
        tone: 'PROFESSIONAL'
      }));
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/ai-megan/configure')
        .send({
          // Missing required companyId
          tone: 'INVALID_TONE'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/ai-megan/interact', () => {
    it('should process AI interaction successfully', async () => {
      const mockInteraction = {
        id: '1',
        type: 'screening',
        candidateId: '123',
        context: { jobId: '456' },
        result: { success: true }
      };

      prismaMock.aIInteraction.create.mockResolvedValue(mockInteraction);

      const response = await request(app)
        .post('/api/ai-megan/interact')
        .send({
          type: 'screening',
          candidateId: '123',
          context: { jobId: '456' }
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(expect.objectContaining({
        type: 'screening',
        candidateId: '123'
      }));
    });

    it('should return 400 for invalid interaction type', async () => {
      const response = await request(app)
        .post('/api/ai-megan/interact')
        .send({
          type: 'invalid',
          candidateId: '123',
          context: {}
        });

      expect(response.status).toBe(400);
    });
  });
});
