import { jest } from '@jest/globals';
import { prismaMock } from '../../../../jest.setup.js';
import companyService from '../company.service.js';
import AppError from '../../../utils/AppError.js';

describe('Company Service', () => {
  describe('createCompany', () => {
    it('should create a company successfully', async () => {
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

      const result = await companyService.createCompany({
        name: 'Test Company',
        website: 'https://test.com',
        phoneNumber: '+1234567890',
        description: 'Test description',
        departments: ['IT', 'HR']
      });

      expect(result).toEqual(mockCompany);
      expect(prismaMock.company.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Company',
          website: 'https://test.com',
          phoneNumber: '+1234567890',
          description: 'Test description',
          departments: ['IT', 'HR']
        }
      });
    });

    it('should throw an error if company name already exists', async () => {
      prismaMock.company.findFirst.mockResolvedValue({ id: '1', name: 'Test Company' });

      await expect(companyService.createCompany({
        name: 'Test Company'
      })).rejects.toThrow(AppError);
    });
  });

  describe('getCompanyById', () => {
    it('should return company if found', async () => {
      const mockCompany = {
        id: '1',
        name: 'Test Company'
      };

      prismaMock.company.findUnique.mockResolvedValue(mockCompany);

      const result = await companyService.getCompanyById('1');
      expect(result).toEqual(mockCompany);
    });

    it('should throw error if company not found', async () => {
      prismaMock.company.findUnique.mockResolvedValue(null);

      await expect(companyService.getCompanyById('1')).rejects.toThrow(AppError);
    });
  });
});
