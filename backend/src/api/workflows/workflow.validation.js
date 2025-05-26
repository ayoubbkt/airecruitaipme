import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { StageType, ActionType, TriggerType, ConditionOperator } = pkg;

// Common schemas
const stageSettingsSchema = z.object({
  timeLimit: z.number().min(1).max(90).optional(), // days
  autoProgress: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  approvers: z.array(z.string()).optional(),
  reminderSettings: z.object({
    enabled: z.boolean().optional(),
    frequency: z.enum(['DAILY', 'WEEKLY']).optional(),
    template: z.string().optional(),
  }).optional(),
  formTemplate: z.string().optional(),
  scoringCriteria: z.array(z.object({
    name: z.string(),
    weight: z.number().min(1).max(10),
    required: z.boolean().optional(),
  })).optional(),
  automationRules: z.array(z.object({
    trigger: z.nativeEnum(TriggerType),
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.nativeEnum(ConditionOperator),
      value: z.any(),
    })).optional(),
    actions: z.array(z.object({
      type: z.nativeEnum(ActionType),
      params: z.record(z.any()).optional(),
    })),
  })).optional(),
});

// Enhanced validation schemas
export const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Workflow name is required').max(100, 'Name too long'),
    description: z.string().max(500).optional(),
    type: z.enum(['RECRUITMENT', 'ONBOARDING', 'REVIEW', 'CUSTOM']),
    isDefault: z.boolean().optional(),
    isEnabled: z.boolean().default(true),
    visibility: z.enum(['PUBLIC', 'PRIVATE', 'TEAM']).default('PRIVATE'),
    team: z.array(z.object({
      userId: z.string(),
      role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
    })).optional(),
    stages: z.array(z.object({
      name: z.string().min(1, 'Stage name is required').max(100, 'Stage name too long'),
      type: z.nativeEnum(StageType),
      description: z.string().max(500).optional(),
      order: z.number().int().min(0),
      isRequired: z.boolean().default(false),
      isParallel: z.boolean().default(false),
      dependsOn: z.array(z.string()).optional(),
      estimatedDuration: z.number().positive().optional(), // in days
      settings: stageSettingsSchema.optional(),
      forms: z.array(z.object({
        id: z.string(),
        required: z.boolean().default(true),
      })).optional(),
      notifications: z.array(z.object({
        event: z.string(),
        template: z.string(),
        recipients: z.array(z.string()),
      })).optional(),
    })).min(1, 'At least one stage is required').max(20, 'Too many stages'),
    metadata: z.object({
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      icon: z.string().optional(),
    }).optional(),
  }),
});

export const updateWorkflowSchema = createWorkflowSchema.partial();

export const updateStageSchema = z.object({
  params: z.object({
    workflowId: z.string().min(1, 'Workflow ID is required'),
    stageId: z.string().min(1, 'Stage ID is required'),
  }),
  body: z.object({
    name: z.string().max(100).optional(),
    type: z.nativeEnum(StageType).optional(),
    description: z.string().max(500).optional(),
    order: z.number().int().min(0).optional(),
    isRequired: z.boolean().optional(),
    isParallel: z.boolean().optional(),
    dependsOn: z.array(z.string()).optional(),
    estimatedDuration: z.number().positive().optional(),
    settings: stageSettingsSchema.optional(),
    forms: z.array(z.object({
      id: z.string(),
      required: z.boolean(),
    })).optional(),
    notifications: z.array(z.object({
      event: z.string(),
      template: z.string(),
      recipients: z.array(z.string()),
    })).optional(),
  }),
});

export const cloneWorkflowSchema = z.object({
  params: z.object({
    workflowId: z.string().min(1, 'Workflow ID is required'),
  }),
  body: z.object({
    name: z.string().min(1, 'New workflow name is required').max(100, 'Name too long'),
    description: z.string().max(500).optional(),
    includeAutomations: z.boolean().default(true),
    includeTeam: z.boolean().default(false),
  }),
});

export const workflowAssignmentSchema = z.object({
  params: z.object({
    workflowId: z.string().min(1, 'Workflow ID is required'),
  }),
  body: z.object({
    entityId: z.string().min(1, 'Entity ID is required'),
    entityType: z.enum(['JOB', 'CANDIDATE', 'EMPLOYEE']),
    startAt: z.string().datetime().optional(),
    assignees: z.array(z.string()).min(1, 'At least one assignee required'),
    overrideSettings: z.record(z.any()).optional(),
  }),
});

export const workflowProgressSchema = z.object({
  params: z.object({
    workflowId: z.string().min(1, 'Workflow ID is required'),
    entityId: z.string().min(1, 'Entity ID is required'),
  }),
  body: z.object({
    action: z.enum(['PROGRESS', 'REGRESS', 'JUMP', 'COMPLETE', 'CANCEL']),
    targetStageId: z.string().optional(),
    comment: z.string().max(1000).optional(),
    formData: z.record(z.any()).optional(),
    files: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
      type: z.string(),
    })).optional(),
  }),
});