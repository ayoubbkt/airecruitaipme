import prisma from '../../../config/db.js';
import IntegrationService from '../integration.service.js';
import { CalendarProvider, IntegrationType } from '../../../generated/prisma/index.js';

// Mock prisma
jest.mock('../../../config/db.js');

describe('IntegrationService', () => {
  let service;
  
  beforeEach(() => {
    service = new IntegrationService();
    jest.clearAllMocks();
  });

  describe('createCalendarIntegration', () => {
    const validCalendarData = {
      type: IntegrationType.CALENDAR,
      provider: CalendarProvider.GOOGLE,
      accessToken: 'valid-token',
      settings: {
        defaultCalendarId: 'primary'
      }
    };

    it('should create a calendar integration', async () => {
      prisma.integration.create.mockResolvedValue({
        id: '1',
        ...validCalendarData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await service.createCalendarIntegration(validCalendarData);
      
      expect(result).toBeDefined();
      expect(result.provider).toBe(CalendarProvider.GOOGLE);
      expect(prisma.integration.create).toHaveBeenCalled();
    });

    it('should validate provider enum', async () => {
      const invalidData = {
        ...validCalendarData,
        provider: 'INVALID_PROVIDER'
      };

      await expect(
        service.createCalendarIntegration(invalidData)
      ).rejects.toThrow();
    });

    it('should handle invalid settings', async () => {
      const invalidData = {
        ...validCalendarData,
        settings: {
          defaultMeetingDuration: 0 // Invalid duration
        }
      };

      await expect(
        service.createCalendarIntegration(invalidData)
      ).rejects.toThrow();
    });
  });

  describe('createJobBoardIntegration', () => {
    const validJobBoardData = {
      type: IntegrationType.JOB_BOARD,
      provider: 'linkedin',
      apiKey: 'valid-key',
      settings: {
        autoPost: true,
        categories: ['engineering']
      }
    };

    it('should create a job board integration', async () => {
      prisma.integration.create.mockResolvedValue({
        id: '1',
        ...validJobBoardData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await service.createJobBoardIntegration(validJobBoardData);
      
      expect(result).toBeDefined();
      expect(result.provider).toBe('linkedin');
    });

    it('should validate settings schema', async () => {
      const invalidData = {
        ...validJobBoardData,
        settings: {
          autoPost: 'invalid-boolean', // Should be boolean
          categories: 'not-an-array' // Should be array
        }
      };

      await expect(
        service.createJobBoardIntegration(invalidData)
      ).rejects.toThrow();
    });
  });

  describe('updateIntegration', () => {
    it('should update integration settings', async () => {
      const updateData = {
        settings: {
          enabled: false
        }
      };

      prisma.integration.update.mockResolvedValue({
        id: '1',
        type: IntegrationType.CALENDAR,
        provider: CalendarProvider.GOOGLE,
        ...updateData,
        updatedAt: new Date()
      });

      const result = await service.updateIntegration('1', updateData);
      
      expect(result).toBeDefined();
      expect(result.settings.enabled).toBe(false);
    });

    it('should validate updated settings', async () => {
      const invalidUpdate = {
        settings: {
          syncInterval: -1 // Invalid interval
        }
      };

      await expect(
        service.updateIntegration('1', invalidUpdate)
      ).rejects.toThrow();
    });
  });

  describe('deleteIntegration', () => {
    it('should delete an integration', async () => {
      prisma.integration.delete.mockResolvedValue({ id: '1' });

      await service.deleteIntegration('1');
      
      expect(prisma.integration.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });

    it('should handle non-existent integration', async () => {
      prisma.integration.delete.mockRejectedValue(new Error('Not found'));

      await expect(
        service.deleteIntegration('non-existent')
      ).rejects.toThrow();
    });
  });

  describe('syncIntegration', () => {
    it('should sync calendar integration', async () => {
      const integration = {
        id: '1',
        type: IntegrationType.CALENDAR,
        provider: CalendarProvider.GOOGLE,
        settings: {
          autoSync: true
        }
      };

      prisma.integration.findUnique.mockResolvedValue(integration);
      prisma.integration.update.mockResolvedValue({
        ...integration,
        lastSyncAt: new Date()
      });

      const result = await service.syncIntegration('1');
      
      expect(result).toBeDefined();
      expect(result.lastSyncAt).toBeDefined();
    });

    it('should handle sync errors', async () => {
      prisma.integration.findUnique.mockResolvedValue({
        id: '1',
        type: IntegrationType.CALENDAR
      });

      prisma.integration.update.mockRejectedValue(new Error('Sync failed'));

      await expect(
        service.syncIntegration('1')
      ).rejects.toThrow('Sync failed');
    });
  });
});
