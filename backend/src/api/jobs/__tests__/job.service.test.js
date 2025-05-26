import { jest } from '@jest/globals';
import { prismaMock } from '../../../../jest.setup.js';
import jobService from '../job.service.js';
import AppError from '../../../utils/AppError.js';

describe('Job Service', () => {
  describe('createJob', () => {
    it('should create a job successfully', async () => {
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

      const result = await jobService.createJob({
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

      expect(result).toEqual(mockJob);
    });

    it('should throw an error if required fields are missing', async () => {
      await expect(jobService.createJob({
        title: 'Software Engineer'
        // Missing required description field
      })).rejects.toThrow();
    });
  });

  describe('getJobById', () => {
    it('should return job if found', async () => {
      const mockJob = {
        id: '1',
        title: 'Software Engineer'
      };

      prismaMock.job.findUnique.mockResolvedValue(mockJob);

      const result = await jobService.getJobById('1');
      expect(result).toEqual(mockJob);
    });

    it('should throw error if job not found', async () => {
      prismaMock.job.findUnique.mockResolvedValue(null);

      await expect(jobService.getJobById('1')).rejects.toThrow(AppError);
    });
  });

  describe('updateJob', () => {
    it('should update job successfully', async () => {
      const mockJob = {
        id: '1',
        title: 'Updated Job Title',
        description: 'Updated description'
      };

      prismaMock.job.update.mockResolvedValue(mockJob);

      const result = await jobService.updateJob('1', {
        title: 'Updated Job Title',
        description: 'Updated description'
      });

      expect(result).toEqual(mockJob);
    });
  });
});
