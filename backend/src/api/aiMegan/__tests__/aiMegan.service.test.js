import prisma from '../../../config/db.js';
import AiMeganService from '../aiMegan.service.js';
import { UserRole, CompanyMemberRole, AITone } from '../../../generated/prisma/index.js';

// Mock prisma
jest.mock('../../../config/db.js');

describe('AiMeganService', () => {
  let service;
  const mockUserId = 'user-123';
  const mockCompanyId = 'company-123';
  const mockJobId = 'job-123';

  // Helper function to mock admin access
  const mockAdminAccess = () => {
    prisma.companyMember.findUnique.mockResolvedValue({
      role: CompanyMemberRole.RECRUITING_ADMIN
    });
    prisma.user.findUnique.mockResolvedValue({
      role: UserRole.COMPANY_ADMIN
    });
  };
  
  beforeEach(() => {
    service = new AiMeganService();
    jest.clearAllMocks();
  });

  describe('getAIBusinessPreferences', () => {
    it('should return business preferences for admin user', async () => {
      // Mock admin access
      prisma.companyMember.findUnique.mockResolvedValue({
        role: CompanyMemberRole.RECRUITING_ADMIN
      });
      prisma.user.findUnique.mockResolvedValue({
        role: UserRole.COMPANY_ADMIN
      });

      // Mock preferences
      prisma.aIBusinessPreference.upsert.mockResolvedValue({
        id: 1,
        companyId: mockCompanyId,
        businessOverview: 'Test overview',
        businessCulture: 'Test culture',
        businessValues: 'Test values',
        businessMission: 'Test mission'
      });

      const result = await service.getAIBusinessPreferences(mockUserId, mockCompanyId);
      
      expect(result).toBeDefined();
      expect(result.businessOverview).toBe('Test overview');
      expect(prisma.aIBusinessPreference.upsert).toHaveBeenCalled();
    });

    it('should throw error for non-admin user', async () => {
      prisma.companyMember.findUnique.mockResolvedValue({
        role: CompanyMemberRole.MEMBER
      });
      prisma.user.findUnique.mockResolvedValue({
        role: UserRole.COMPANY_USER
      });

      await expect(
        service.configureAIScreening(mockUserId, mockJobId, {
          isEnabled: true,
          guidance: {
            customQuestions: [
              {
                question: 'Too short', // Should fail validation
                expectedAnswer: '',
                weight: 15 // Exceeds max weight
              }
            ],
            minimumScore: 120 // Exceeds max score
          }
        })
      ).rejects.toThrow('Validation failed');
    });

    it('should validate business preferences inputs', async () => {
      mockAdminAccess();

      await expect(
        service.updateAIBusinessPreferences(mockUserId, mockCompanyId, {
          businessOverview: 'a'.repeat(2500), // Exceeds max length
          businessCulture: '', // Too short
          businessValues: 'ok',  // Too short
          businessMission: 'x'.repeat(5) // Too short
        })
      ).rejects.toThrow('Validation failed');
    });

    it('should validate communication preferences', async () => {
      mockAdminAccess();
      
      await expect(
        service.updateAICommunicationPreferences(mockUserId, mockCompanyId, {
          tone: 'INVALID_TONE', // Invalid enum value
          blockedTeamTopics: Array(50).fill('topic'), // Too many topics
          blockedCandidateTopics: [''], // Empty topic
          languagePreference: 'invalid' // Invalid language code
        })
      ).rejects.toThrow('Validation failed');
    });

    it('should handle AI interaction validation', async () => {
      mockAdminAccess();
      
      // Mock job for screening
      prisma.job.findUnique.mockResolvedValue({
        id: 'job-123',
        aiScreeningConfig: {
          isEnabled: true,
          guidance: {
            minimumScore: 70
          }
        }
      });

      // Mock interaction creation and update
      prisma.aIInteraction.create.mockResolvedValue({
        id: 'interaction-1',
        type: 'screening',
        candidateId: 'candidate-123',
        context: {
          jobId: 'job-123',
          questions: ['Q1', 'Q2']
        },
        status: 'PENDING'
      });

      prisma.aIInteraction.update.mockResolvedValue({
        id: 'interaction-1',
        status: 'COMPLETED',
        result: {
          success: true,
          scores: [
            { question: 'Q1', score: 80, feedback: 'Good' },
            { question: 'Q2', score: 75, feedback: 'Good' }
          ],
          overallScore: 77.5,
          recommendation: 'Proceed with interview'
        }
      });

      const result = await service.handleAIInteraction('user-123', {
        type: 'screening',
        candidateId: 'candidate-123',
        context: {
          jobId: 'job-123',
          questions: ['Q1', 'Q2']
        }
      });

      expect(result.status).toBe('COMPLETED');
      expect(result.result.success).toBe(true);
      expect(result.result.scores).toHaveLength(2);
    });

    it('should handle scheduling interaction', async () => {
      mockAdminAccess();

      const timeSlots = [
        '2025-05-25T10:00:00Z',
        '2025-05-25T14:00:00Z',
        '2025-05-26T09:00:00Z',
        '2025-05-26T15:00:00Z'
      ];

      prisma.aIInteraction.create.mockResolvedValue({
        id: 'interaction-2',
        type: 'scheduling',
        candidateId: 'candidate-123',
        context: { timeSlots },
        status: 'PENDING'
      });

      prisma.aIInteraction.update.mockResolvedValue({
        id: 'interaction-2',
        status: 'COMPLETED',
        result: {
          success: true,
          suggestedSlots: timeSlots.slice(0, 3),
          reasoning: 'Selected based on candidate availability'
        }
      });

      const result = await service.handleAIInteraction('user-123', {
        type: 'scheduling',
        candidateId: 'candidate-123',
        context: { timeSlots }
      });

      expect(result.status).toBe('COMPLETED');
      expect(result.result.suggestedSlots).toHaveLength(3);
    });

    it('should validate interaction context', async () => {
      mockAdminAccess();

      // Test invalid screening context
      await expect(
        service.handleAIInteraction('user-123', {
          type: 'screening',
          candidateId: 'candidate-123',
          context: {} // Missing jobId and questions
        })
      ).rejects.toThrow('Invalid screening context');

      // Test invalid scheduling context
      await expect(
        service.handleAIInteraction('user-123', {
          type: 'scheduling',
          candidateId: 'candidate-123',
          context: { timeSlots: [] } // Empty timeSlots
        })
      ).rejects.toThrow('Invalid scheduling context');

      // Test unsupported interaction type
      await expect(
        service.handleAIInteraction('user-123', {
          type: 'invalid',
          candidateId: 'candidate-123',
          context: {}
        })
      ).rejects.toThrow('Unsupported interaction type');
    });
  });

  describe('updateAICommunicationPreferences', () => {
    const mockPrefs = {
      tone: AITone.PROFESSIONAL_FORMAL,
      blockedTeamTopics: ['topic1'],
      blockedCandidateTopics: ['topic2'],
      languagePreference: 'en-US'
    };

    it('should update communication preferences for admin user', async () => {
      prisma.companyMember.findUnique.mockResolvedValue({
        role: CompanyMemberRole.RECRUITING_ADMIN
      });
      prisma.user.findUnique.mockResolvedValue({
        role: UserRole.COMPANY_ADMIN
      });

      prisma.aICommunicationPreference.upsert.mockResolvedValue({
        id: 1,
        companyId: mockCompanyId,
        ...mockPrefs
      });

      const result = await service.updateAICommunicationPreferences(
        mockUserId,
        mockCompanyId,
        mockPrefs
      );

      expect(result).toBeDefined();
      expect(result.tone).toBe(AITone.PROFESSIONAL_FORMAL);
      expect(prisma.aICommunicationPreference.upsert).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
        create: expect.objectContaining(mockPrefs),
        update: expect.objectContaining(mockPrefs)
      });
    });
  });

  describe('configureAIScreening', () => {
    const mockConfig = {
      isEnabled: true,
      guidance: {
        customQuestions: [
          {
            question: 'Test question',
            expectedAnswer: 'Test answer',
            weight: 5
          }
        ],
        skillsToAssess: ['skill1', 'skill2'],
        minimumScore: 70,
        feedbackDetail: 'detailed'
      }
    };

    it('should configure AI screening for a job', async () => {
      prisma.companyMember.findUnique.mockResolvedValue({
        role: CompanyMemberRole.RECRUITING_ADMIN
      });
      prisma.user.findUnique.mockResolvedValue({
        role: UserRole.COMPANY_ADMIN
      });

      prisma.jobAIScreening.upsert.mockResolvedValue({
        id: 1,
        jobId: 'job-123',
        ...mockConfig
      });

      const result = await service.configureAIScreening(
        mockUserId,
        'job-123',
        mockConfig
      );

      expect(result).toBeDefined();
      expect(result.isEnabled).toBe(true);
      expect(result.guidance.minimumScore).toBe(70);
    });
  });
});
