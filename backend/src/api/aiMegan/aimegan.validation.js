import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { AITone, UserRole, CompanyMemberRole } = pkg;

// Business Preferences Validation
export const businessPreferencesSchema = z.object({
  body: z.object({
    businessOverview: z.string().min(10).max(2000).optional(),
    businessCulture: z.string().min(10).max(2000).optional(),
    businessValues: z.string().min(10).max(2000).optional(),
    businessMission: z.string().min(10).max(2000).optional(),
  }),
});

// Communication Preferences Validation
export const communicationPreferencesSchema = z.object({
  body: z.object({
    tone: z.nativeEnum(AITone),
    blockedTeamTopics: z.array(z.string()).default([]),
    blockedCandidateTopics: z.array(z.string()).default([]),
    languagePreference: z.string().min(2).max(5).optional(), // ISO language code
  }),
});

// AI Screening Configuration
export const aiScreeningConfigSchema = z.object({
  body: z.object({
    isEnabled: z.boolean(),
    guidance: z.object({
      customQuestions: z.array(
        z.object({
          question: z.string().min(10).max(500),
          expectedAnswer: z.string().min(10).max(1000).optional(),
          weight: z.number().min(1).max(10).optional(),
        })
      ).max(10).optional(),
      skillsToAssess: z.array(z.string()).min(1).max(20).optional(),
      minimumScore: z.number().min(0).max(100).optional(),
      feedbackDetail: z.enum(['basic', 'detailed', 'comprehensive']).optional(),
    }).optional(),
  }),
});

// General Megan Configuration
export const configureMeganSchema = z.object({
  body: z.object({
    companyId: z.string().min(1, 'Company ID is required'),
    aiScreeningConfig: z.object({
      enabled: z.boolean(),
      customQuestions: z.array(z.string()).max(10).optional(),
      skillsToAssess: z.array(z.string()).max(20).optional(),
      minimumScore: z.number().min(0).max(100).optional(),
    }).optional(),
    aiSchedulingConfig: z.object({
      enabled: z.boolean(),
      availabilityWindow: z.number().positive().max(30).optional(), // max 30 days
      reminderEnabled: z.boolean().optional(),
      reminderHours: z.number().positive().max(72).optional(), // max 72 hours
    }).optional(),
    tone: z.nativeEnum(AITone).optional(),
    language: z.string().min(2).max(5).optional(), // ISO language code
  }),
});

// AI Interaction Validation
export const aiInteractionSchema = z.object({
  body: z.object({
    type: z.enum(['screening', 'scheduling', 'note-taking']),
    candidateId: z.string().min(1, 'Candidate ID is required'),
    context: z.record(z.any()).refine((data) => {
      if (data.type === 'screening') {
        return data.jobId && data.questions;
      }
      if (data.type === 'scheduling') {
        return data.timeSlots && Array.isArray(data.timeSlots);
      }
      return true;
    }, {
      message: "Context must include required fields based on interaction type"
    }),
  }),
});