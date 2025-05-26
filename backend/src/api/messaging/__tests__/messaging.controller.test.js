import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../app.js';
import { prismaMock } from '../../../../jest.setup.js';
import { MessageStatus, ThreadType, CommentVisibility } from '../../../generated/prisma/index.js';
import MessagingController from '../messaging.controller.js';
import MessagingService from '../messaging.service.js';

// Mock the messaging service
jest.mock('../messaging.service.js');

describe('Messaging Tests', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com'
  };

  const mockThread = {
    id: 'thread-1',
    type: ThreadType.DIRECT,
    subject: 'Test Thread',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('POST /api/messages', () => {
    const validMessage = {
      content: 'Test message content',
      recipientId: 'user-2',
      visibility: CommentVisibility.PRIVATE,
      attachments: [
        {
          name: 'test.pdf',
          url: 'https://example.com/test.pdf',
          type: 'application/pdf',
          size: 1024
        }
      ],
      metadata: {
        priority: MessagePriority.HIGH,
        scheduledFor: new Date().toISOString()
      }
    };

    it('should create a new message successfully', async () => {
      const mockCreatedMessage = {
        id: 'msg-1',
        ...validMessage,
        senderId: mockUser.id,
        threadId: mockThread.id,
        status: MessageStatus.SENT,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.message.create.mockResolvedValue(mockCreatedMessage);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/messages')
        .send(validMessage);

      expect(response.status).toBe(201);
      expect(response.body.data.content).toBe(validMessage.content);
    });

    it('should validate message content length', async () => {
      const invalidMessage = {
        ...validMessage,
        content: 'a'.repeat(11000) // Exceeds max length
      };

      const response = await request(app)
        .post('/api/messages')
        .send(invalidMessage);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Message too long');
    });

    it('should validate attachments', async () => {
      const invalidMessage = {
        ...validMessage,
        attachments: [
          {
            name: 'test.exe',
            url: 'invalid-url',
            type: 'invalid-mime-type',
            size: 20 * 1024 * 1024 // Exceeds max size
          }
        ]
      };

      const response = await request(app)
        .post('/api/messages')
        .send(invalidMessage);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid attachment');
    });
  });

  describe('POST /api/messages/threads', () => {
    const validThread = {
      type: ThreadType.DIRECT,
      participants: ['user-2', 'user-3'],
      subject: 'New Discussion',
      initialMessage: {
        content: 'Initial thread message',
        attachments: []
      }
    };

    it('should create a new thread successfully', async () => {
      const mockCreatedThread = {
        id: 'thread-1',
        ...validThread,
        creatorId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.thread.create.mockResolvedValue(mockCreatedThread);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/messages/threads')
        .send(validThread);

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe(ThreadType.DIRECT);
    });

    it('should validate participants limit', async () => {
      const invalidThread = {
        ...validThread,
        participants: Array(51).fill('user-id') // Exceeds max participants
      };

      const response = await request(app)
        .post('/api/messages/threads')
        .send(invalidThread);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Too many participants');
    });
  });

  describe('GET /api/messages/threads/:threadId', () => {
    it('should get thread messages with pagination', async () => {
      const mockMessages = Array(10).fill(null).map((_, i) => ({
        id: `msg-${i}`,
        content: `Message ${i}`,
        senderId: mockUser.id,
        threadId: mockThread.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      prismaMock.message.findMany.mockResolvedValue(mockMessages);
      prismaMock.thread.findUnique.mockResolvedValue(mockThread);

      const response = await request(app)
        .get('/api/messages/threads/thread-1')
        .query({ page: '1', limit: '10' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(10);
    });

    it('should filter messages by status and date range', async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7);

      const response = await request(app)
        .get('/api/messages/threads/thread-1')
        .query({
          status: MessageStatus.SENT,
          fromDate: fromDate.toISOString(),
          toDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/messages/:messageId', () => {
    it('should update message successfully', async () => {
      const updateData = {
        content: 'Updated content',
        metadata: {
          isRead: true,
          isFlagged: true
        }
      };

      const mockUpdatedMessage = {
        id: 'msg-1',
        ...updateData,
        senderId: mockUser.id,
        threadId: mockThread.id,
        updatedAt: new Date()
      };

      prismaMock.message.update.mockResolvedValue(mockUpdatedMessage);

      const response = await request(app)
        .put('/api/messages/msg-1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.content).toBe(updateData.content);
    });
  });

  describe('POST /api/messages/threads/:threadId/participants', () => {
    it('should manage thread participants successfully', async () => {
      const participantChanges = {
        addParticipants: ['user-4'],
        removeParticipants: ['user-3']
      };

      prismaMock.thread.update.mockResolvedValue({
        ...mockThread,
        participants: ['user-1', 'user-2', 'user-4']
      });

      const response = await request(app)
        .post('/api/messages/threads/thread-1/participants')
        .send(participantChanges);

      expect(response.status).toBe(200);
      expect(response.body.data.participants).toContain('user-4');
      expect(response.body.data.participants).not.toContain('user-3');
    });

    it('should validate participant changes', async () => {
      const invalidChanges = {
        addParticipants: [],
        removeParticipants: []
      };

      const response = await request(app)
        .post('/api/messages/threads/thread-1/participants')
        .send(invalidChanges);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Must specify participants');
    });
  });

  describe('MessagingController', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        user: { id: 1 },
        params: { applicationId: '1' },
        body: {},
        query: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
      jest.clearAllMocks();
    });

    describe('sendMessage', () => {
      it('should successfully send a message', async () => {
        const mockMessage = {
          id: 1,
          content: 'Test message',
          senderId: 1,
          isInternalNote: false
        };

        MessagingService.sendMessage.mockResolvedValue(mockMessage);
        req.body = {
          content: 'Test message'
        };

        await MessagingController.sendMessage(req, res, next);

        expect(MessagingService.sendMessage).toHaveBeenCalledWith(
          req.user.id,
          req.params.applicationId,
          req.body
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Message sent.',
          data: mockMessage
        });
      });

      it('should handle errors during message sending', async () => {
        const error = new Error('Failed to send message');
        MessagingService.sendMessage.mockRejectedValue(error);

        await MessagingController.sendMessage(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });
    });

    describe('getMessagesForApplication', () => {
      it('should successfully retrieve messages', async () => {
        const mockMessages = {
          data: [
            { id: 1, content: 'Message 1' },
            { id: 2, content: 'Message 2' }
          ],
          currentPage: 1,
          totalPages: 1,
          totalMessages: 2
        };

        MessagingService.getMessagesForApplication.mockResolvedValue(mockMessages);

        await MessagingController.getMessagesForApplication(req, res, next);

        expect(MessagingService.getMessagesForApplication).toHaveBeenCalledWith(
          req.user.id,
          req.params.applicationId,
          req.query
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockMessages);
      });

      it('should handle errors when retrieving messages', async () => {
        const error = new Error('Failed to retrieve messages');
        MessagingService.getMessagesForApplication.mockRejectedValue(error);

        await MessagingController.getMessagesForApplication(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

      it('should pass query parameters to the service', async () => {
        req.query = {
          page: '2',
          limit: '10'
        };

        await MessagingController.getMessagesForApplication(req, res, next);

        expect(MessagingService.getMessagesForApplication).toHaveBeenCalledWith(
          req.user.id,
          req.params.applicationId,
          req.query
        );
      });
    });
  });
});
