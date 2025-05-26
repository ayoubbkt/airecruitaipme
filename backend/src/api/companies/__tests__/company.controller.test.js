import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../app.js';
import { prismaMock } from '../../../../jest.setup.js';

describe('Company Controller Integration Tests', () => {
  describe('POST /api/companies', () => {
    it('should create a new company', async () => {
      const mockCompany = {
        id: '1',
        name: 'Test Company',
        website: 'https://test.com',
        phoneNumber: '+1234567890',
        description: 'Test description',
        departments: ['IT', 'HR'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.company.create.mockResolvedValue(mockCompany);

      const response = await request(app)
        .post('/api/companies')
        .send({
          name: 'Test Company',
          website: 'https://test.com',
          phoneNumber: '+1234567890',
          description: 'Test description',
          departments: ['IT', 'HR']
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(expect.objectContaining({
        name: 'Test Company',
        website: 'https://test.com'
      }));
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/companies')
        .send({
          website: 'https://test.com' // Missing required name field
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should return company by id', async () => {
      const mockCompany = {
        id: '1',
        name: 'Test Company'
      };

      prismaMock.company.findUnique.mockResolvedValue(mockCompany);

      const response = await request(app)
        .get('/api/companies/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockCompany);
    });

    it('should return 404 if company not found', async () => {
      prismaMock.company.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/companies/999');

      expect(response.status).toBe(404);
    });
  });
});
