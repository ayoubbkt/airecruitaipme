import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../app.js';
import { prismaMock } from '../../../../jest.setup.js';

describe('Job Controller Integration Tests', () => {
  describe('POST /api/jobs', () => {
    it('should create a new job', async () => {
      const mockJob = {
        id: '1',
        title: 'Software Engineer',
        description: 'Test job description',
        employmentType: 'FULL_TIME',
        workType: 'REMOTE',
        salaryMin: 50000,
        salaryMax: 80000,
        currency: 'USD',
        departmentName: 'Engineering',
        location: 'New York',
        requirements: ['JavaScript', 'React'],
        responsibilities: ['Development', 'Code Review'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.job.create.mockResolvedValue(mockJob);

      const response = await request(app)
        .post('/api/jobs')
        .send({
          title: 'Software Engineer',
          description: 'Test job description',
          employmentType: 'FULL_TIME',
          workType: 'REMOTE',
          salaryMin: 50000,
          salaryMax: 80000,
          currency: 'USD',
          departmentName: 'Engineering',
          location: 'New York',
          requirements: ['JavaScript', 'React'],
          responsibilities: ['Development', 'Code Review']
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(expect.objectContaining({
        title: 'Software Engineer',
        description: 'Test job description'
      }));
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .send({
          title: 'Software Engineer'
          // Missing required description field
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/jobs', () => {
    it('should return paginated jobs', async () => {
      const mockJobs = [
        {
          id: '1',
          title: 'Software Engineer',
          description: 'Job 1'
        },
        {
          id: '2',
          title: 'Product Manager',
          description: 'Job 2'
        }
      ];

      prismaMock.job.findMany.mockResolvedValue(mockJobs);
      prismaMock.job.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/jobs')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should return job by id', async () => {
      const mockJob = {
        id: '1',
        title: 'Software Engineer'
      };

      prismaMock.job.findUnique.mockResolvedValue(mockJob);

      const response = await request(app)
        .get('/api/jobs/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockJob);
    });

    it('should return 404 if job not found', async () => {
      prismaMock.job.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/jobs/999');

      expect(response.status).toBe(404);
    });
  });
});
