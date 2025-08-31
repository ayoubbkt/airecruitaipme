import MessagingService from '../messaging.service.js';
import prisma from '../../../config/db.js';
import { UserRole, CompanyMemberRole, CommentVisibility } from '../../../generated/prisma/index.js';

// Mock Prisma
jest.mock('../../../config/db.js');

describe('MessagingService', () => {
  // Mock data
  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: UserRole.USER
  };

  const mockCandidate = {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    role: UserRole.USER
  };

  const mockAdmin = {
    id: 3,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: UserRole.MEGA_ADMIN
  };

  const mockApplication = {
    id: 1,
    candidateId: 2,
    job: {
      companyId: 1,
      hiringTeam: []
    }
  };

  const mockThread = {
    id: 1,
    applicationId: 1
  };

  const mockMessage = {
    id: 1,
    threadId: 1,
    senderId: 1,
    content: 'Test message',
    isInternalNote: false,
    visibility: null,
    attachments: [],
    sender: mockUser
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should successfully send a regular message', async () => {
      // Mock necessary Prisma calls
      prisma.application.findUnique.mockResolvedValue(mockApplication);
      prisma.messageThread.upsert.mockResolvedValue(mockThread);
      prisma.message.create.mockResolvedValue(mockMessage);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.companyMember.findFirst.mockResolvedValue({ role: CompanyMemberRole.HIRING_MANAGER });

      const messageData = {
        content: 'Test message',
        attachments: []
      };

      const result = await MessagingService.sendMessage(mockUser.id, mockApplication.id, messageData);

      expect(result).toEqual(mockMessage);
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          threadId: mockThread.id,
          senderId: mockUser.id,
          content: 'Test message',
          isInternalNote: false,
          visibility: null,
          attachments: []
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
      });
    });

    it('should successfully send an internal note with valid visibility', async () => {
      const internalNoteMessage = {
        ...mockMessage,
        isInternalNote: true,
        visibility: CommentVisibility.PRIVATE
      };

      prisma.application.findUnique.mockResolvedValue(mockApplication);
      prisma.messageThread.upsert.mockResolvedValue(mockThread);
      prisma.message.create.mockResolvedValue(internalNoteMessage);
      prisma.user.findUnique.mockResolvedValue(mockAdmin);
      prisma.companyMember.findFirst.mockResolvedValue({ role: CompanyMemberRole.RECRUITING_ADMIN });

      const messageData = {
        content: 'Internal note',
        isInternalNote: true,
        visibility: CommentVisibility.PRIVATE
      };

      const result = await MessagingService.sendMessage(mockAdmin.id, mockApplication.id, messageData);

      expect(result).toEqual(internalNoteMessage);
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          threadId: mockThread.id,
          senderId: mockAdmin.id,
          content: 'Internal note',
          isInternalNote: true,
          visibility: CommentVisibility.PRIVATE,
          attachments: []
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
      });
    });

    it('should prevent candidates from sending internal notes', async () => {
      prisma.application.findUnique.mockResolvedValue({
        ...mockApplication,
        candidateId: mockCandidate.id
      });

      const messageData = {
        content: 'Try internal note',
        isInternalNote: true,
        visibility: CommentVisibility.PRIVATE
      };

      await expect(
        MessagingService.sendMessage(mockCandidate.id, mockApplication.id, messageData)
      ).rejects.toThrow('Candidates cannot send internal notes.');
    });

    it('should require visibility for internal notes', async () => {
      prisma.application.findUnique.mockResolvedValue(mockApplication);
      prisma.user.findUnique.mockResolvedValue(mockAdmin);
      prisma.companyMember.findFirst.mockResolvedValue({ role: CompanyMemberRole.RECRUITING_ADMIN });

      const messageData = {
        content: 'Internal note without visibility',
        isInternalNote: true
      };

      await expect(
        MessagingService.sendMessage(mockAdmin.id, mockApplication.id, messageData)
      ).rejects.toThrow('Visibility is required for internal notes.');
    });
  });

  describe('getMessagesForApplication', () => {
    const mockMessages = [
      {
        id: 1,
        content: 'Regular message',
        isInternalNote: false,
        sender: mockUser
      },
      {
        id: 2,
        content: 'Internal note',
        isInternalNote: true,
        visibility: CommentVisibility.PRIVATE,
        sender: mockAdmin
      }
    ];

    it('should return messages for a hiring team member with proper access', async () => {
      prisma.application.findUnique.mockResolvedValue(mockApplication);
      prisma.messageThread.findUnique.mockResolvedValue(mockThread);
      prisma.message.findMany.mockResolvedValue(mockMessages);
      prisma.message.count.mockResolvedValue(mockMessages.length);
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        companyMemberships: [{ role: CompanyMemberRole.HIRING_MANAGER }]
      });
      prisma.companyMember.findFirst.mockResolvedValue({ role: CompanyMemberRole.HIRING_MANAGER });

      const result = await MessagingService.getMessagesForApplication(mockUser.id, mockApplication.id, {});

      expect(result.data).toEqual(mockMessages);
      expect(result.totalMessages).toBe(mockMessages.length);
    });

    it('should filter out internal notes for candidates', async () => {
      const filteredMessages = mockMessages.filter(m => !m.isInternalNote);
      
      prisma.application.findUnique.mockResolvedValue({
        ...mockApplication,
        candidateId: mockCandidate.id
      });
      prisma.messageThread.findUnique.mockResolvedValue(mockThread);
      prisma.message.findMany.mockResolvedValue(filteredMessages);
      prisma.message.count.mockResolvedValue(filteredMessages.length);

      const result = await MessagingService.getMessagesForApplication(mockCandidate.id, mockApplication.id, {});

      expect(result.data).toEqual(filteredMessages);
      expect(result.data.every(m => !m.isInternalNote)).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      prisma.application.findUnique.mockResolvedValue(mockApplication);
      prisma.messageThread.findUnique.mockResolvedValue(mockThread);
      prisma.message.findMany.mockResolvedValue(mockMessages);
      prisma.message.count.mockResolvedValue(mockMessages.length);
      prisma.user.findUnique.mockResolvedValue(mockAdmin);
      prisma.companyMember.findFirst.mockResolvedValue({ role: CompanyMemberRole.RECRUITING_ADMIN });

      const result = await MessagingService.getMessagesForApplication(mockAdmin.id, mockApplication.id, {
        page: 1,
        limit: 10
      });

      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10
        })
      );
    });

    it('should throw error for non-existent application', async () => {
      prisma.application.findUnique.mockResolvedValue(null);

      await expect(
        MessagingService.getMessagesForApplication(mockUser.id, 999, {})
      ).rejects.toThrow('Application not found.');
    });
  });
});
