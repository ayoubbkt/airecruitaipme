import { jest } from '@jest/globals';
import { prismaMock } from '../../../../jest.setup.js';
import ratingService from '../rating.service.js';
import AppError from '../../../utils/AppError.js';

describe('Rating Service', () => {
  describe('createRating', () => {
    it('should create rating successfully', async () => {
      const mockRating = {
        id: '1',
        candidateId: '123',
        recruiterId: '456',
        score: 4.5,
        feedback: 'Great technical skills',
        category: 'TECHNICAL_TEST',
        jobId: '789',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.rating.create.mockResolvedValue(mockRating);

      const result = await ratingService.createRating({
        candidateId: '123',
        recruiterId: '456',
        score: 4.5,
        feedback: 'Great technical skills',
        category: 'TECHNICAL_TEST',
        jobId: '789'
      });

      expect(result).toEqual(mockRating);
      expect(prismaMock.rating.create).toHaveBeenCalledWith({
        data: {
          candidateId: '123',
          recruiterId: '456',
          score: 4.5,
          feedback: 'Great technical skills',
          category: 'TECHNICAL_TEST',
          jobId: '789'
        }
      });
    });

    it('should throw error for invalid score', async () => {
      await expect(ratingService.createRating({
        candidateId: '123',
        recruiterId: '456',
        score: 6, // Invalid score > 5
        feedback: 'Test feedback',
        category: 'TECHNICAL_TEST',
        jobId: '789'
      })).rejects.toThrow();
    });
  });

  describe('getRatingsByCandidate', () => {
    it('should return ratings for candidate', async () => {
      const mockRatings = [
        {
          id: '1',
          candidateId: '123',
          score: 4.5,
          category: 'TECHNICAL_TEST'
        },
        {
          id: '2',
          candidateId: '123',
          score: 4.0,
          category: 'SOFT_SKILLS'
        }
      ];

      prismaMock.rating.findMany.mockResolvedValue(mockRatings);

      const result = await ratingService.getRatingsByCandidate('123');
      expect(result).toEqual(mockRatings);
      expect(result).toHaveLength(2);
    });
  });

  describe('updateRating', () => {
    it('should update rating successfully', async () => {
      const mockRating = {
        id: '1',
        score: 4.0,
        feedback: 'Updated feedback'
      };

      prismaMock.rating.update.mockResolvedValue(mockRating);

      const result = await ratingService.updateRating('1', {
        score: 4.0,
        feedback: 'Updated feedback'
      });

      expect(result).toEqual(mockRating);
    });

    it('should throw error if rating not found', async () => {
      prismaMock.rating.findUnique.mockResolvedValue(null);

      await expect(ratingService.updateRating('999', {
        score: 4.0
      })).rejects.toThrow(AppError);
    });
  });
});
