import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { CommentVisibility, MessagePriority, MessageStatus, ThreadType } = pkg;

// Common message schemas
const attachmentSchema = z.object({
  name: z.string().max(255, 'File name too long'),
  url: z.string().url('Invalid attachment URL'),
  type: z.string().regex(/^[a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+$/, 'Invalid MIME type'),
  size: z.number().max(10 * 1024 * 1024, 'File size exceeds 10MB').optional(),
});

const messageMetadataSchema = z.object({
  isRead: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  isFlagged: z.boolean().default(false),
  priority: z.nativeEnum(MessagePriority).default('NORMAL'),
  scheduledFor: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

// Message creation schema
export const createMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content is required').max(10000, 'Message too long'),
    recipientId: z.string().min(1, 'Recipient ID is required'),
    threadId: z.string().optional(),
    subject: z.string().max(200, 'Subject too long').optional(),
    visibility: z.nativeEnum(CommentVisibility).default('PRIVATE'),
    attachments: z.array(attachmentSchema).max(10, 'Too many attachments').optional(),
    metadata: messageMetadataSchema.optional(),
    replyTo: z.string().optional(),
    mentions: z.array(z.string()).max(20, 'Too many mentions').optional(),
  }),
});

// Thread creation schema
export const createThreadSchema = z.object({
  body: z.object({
    type: z.nativeEnum(ThreadType),
    participants: z.array(z.string()).min(1, 'At least one participant required').max(50, 'Too many participants'),
    subject: z.string().max(200, 'Subject too long').optional(),
    initialMessage: z.object({
      content: z.string().min(1, 'Initial message content is required').max(10000, 'Message too long'),
      attachments: z.array(attachmentSchema).max(10, 'Too many attachments').optional(),
      metadata: messageMetadataSchema.optional(),
    }),
  }),
});

// Get thread messages schema
export const getThreadMessagesSchema = z.object({
  params: z.object({
    threadId: z.string().min(1, 'Thread ID is required'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.nativeEnum(MessageStatus).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    searchTerm: z.string().max(100).optional(),
  }),
});

// Update message schema
export const updateMessageSchema = z.object({
  params: z.object({
    messageId: z.string().min(1, 'Message ID is required'),
  }),
  body: z.object({
    content: z.string().min(1, 'Message content is required').max(10000, 'Message too long').optional(),
    metadata: messageMetadataSchema.optional(),
    visibility: z.nativeEnum(CommentVisibility).optional(),
  }),
});

// Thread participant management schema
export const manageThreadParticipantsSchema = z.object({
  params: z.object({
    threadId: z.string().min(1, 'Thread ID is required'),
  }),
  body: z.object({
    addParticipants: z.array(z.string()).optional(),
    removeParticipants: z.array(z.string()).optional(),
  }).refine(
    data => (data.addParticipants && data.addParticipants.length > 0) || 
            (data.removeParticipants && data.removeParticipants.length > 0),
    { message: 'Must specify participants to add or remove' }
  ),
});