import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../app.js';
import { prismaMock } from '../../../../jest.setup.js';
import { StageType, ActionType, TriggerType } from '../../../generated/prisma/index.js';

describe('Workflows Tests', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com'
  };

  describe('POST /api/workflows', () => {
    const validWorkflow = {
      name: 'Standard Recruitment Process',
      description: 'Default recruitment workflow',
      type: 'RECRUITMENT',
      isDefault: true,
      stages: [
        {
          name: 'Application Review',
          type: StageType.REVIEW,
          description: 'Initial application screening',
          order: 0,
          isRequired: true,
          estimatedDuration: 3,
          settings: {
            timeLimit: 5,
            autoProgress: false,
            requireApproval: true,
            approvers: ['user-2'],
            scoringCriteria: [
              {
                name: 'Experience Match',
                weight: 8,
                required: true
              }
            ],
            automationRules: [
              {
                trigger: TriggerType.STAGE_ENTER,
                actions: [
                  {
                    type: ActionType.SEND_NOTIFICATION,
                    params: {
                      template: 'application-review'
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          name: 'Technical Interview',
          type: StageType.INTERVIEW,
          order: 1,
          isRequired: true,
          settings: {
            formTemplate: 'technical-interview-form'
          }
        }
      ]
    };

    it('should create workflow successfully', async () => {
      const mockCreatedWorkflow = {
        id: 'workflow-1',
        ...validWorkflow,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.workflow.create.mockResolvedValue(mockCreatedWorkflow);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/workflows')
        .send(validWorkflow);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe(validWorkflow.name);
      expect(response.body.data.stages).toHaveLength(2);
    });

    it('should validate workflow data', async () => {
      const invalidWorkflow = {
        ...validWorkflow,
        name: '', // Empty name
        stages: [] // No stages
      };

      const response = await request(app)
        .post('/api/workflows')
        .send(invalidWorkflow);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate stage settings', async () => {
      const workflowWithInvalidStage = {
        ...validWorkflow,
        stages: [
          {
            ...validWorkflow.stages[0],
            settings: {
              timeLimit: 100, // Exceeds max
              scoringCriteria: [
                {
                  name: 'Invalid Score',
                  weight: 15 // Exceeds max weight
                }
              ]
            }
          }
        ]
      };

      const response = await request(app)
        .post('/api/workflows')
        .send(workflowWithInvalidStage);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('PUT /api/workflows/:id', () => {
    it('should update workflow', async () => {
      const updateData = {
        name: 'Updated Workflow',
        stages: [
          {
            name: 'New Stage',
            type: StageType.TASK,
            order: 0,
            settings: {
              formTemplate: 'new-task-form'
            }
          }
        ]
      };

      prismaMock.workflow.update.mockResolvedValue({
        id: 'workflow-1',
        ...updateData,
        updatedAt: new Date()
      });

      const response = await request(app)
        .put('/api/workflows/workflow-1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('POST /api/workflows/:id/clone', () => {
    it('should clone workflow', async () => {
      const cloneData = {
        name: 'Cloned Workflow',
        includeAutomations: true
      };

      const mockClonedWorkflow = {
        id: 'workflow-2',
        name: cloneData.name,
        stages: validWorkflow.stages,
        createdAt: new Date()
      };

      prismaMock.workflow.findUnique.mockResolvedValue({
        id: 'workflow-1',
        ...validWorkflow
      });

      prismaMock.workflow.create.mockResolvedValue(mockClonedWorkflow);

      const response = await request(app)
        .post('/api/workflows/workflow-1/clone')
        .send(cloneData);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe(cloneData.name);
      expect(response.body.data.stages).toHaveLength(validWorkflow.stages.length);
    });
  });

  describe('POST /api/workflows/:id/assign', () => {
    const assignmentData = {
      entityId: 'job-1',
      entityType: 'JOB',
      assignees: ['user-2', 'user-3'],
      startAt: new Date().toISOString()
    };

    it('should assign workflow', async () => {
      const mockAssignment = {
        id: 'assignment-1',
        workflowId: 'workflow-1',
        ...assignmentData,
        status: 'ACTIVE',
        currentStage: 0,
        createdAt: new Date()
      };

      prismaMock.workflowAssignment.create.mockResolvedValue(mockAssignment);

      const response = await request(app)
        .post('/api/workflows/workflow-1/assign')
        .send(assignmentData);

      expect(response.status).toBe(201);
      expect(response.body.data.entityId).toBe(assignmentData.entityId);
    });
  });

  describe('POST /api/workflows/:id/:entityId/progress', () => {
    const progressData = {
      action: 'PROGRESS',
      comment: 'Approved to next stage',
      formData: {
        score: 85,
        feedback: 'Good candidate'
      }
    };

    it('should update workflow progress', async () => {
      const mockProgress = {
        assignmentId: 'assignment-1',
        fromStage: 0,
        toStage: 1,
        actionType: 'PROGRESS',
        actionBy: mockUser.id,
        createdAt: new Date()
      };

      prismaMock.workflowProgress.create.mockResolvedValue(mockProgress);

      const response = await request(app)
        .post('/api/workflows/workflow-1/job-1/progress')
        .send(progressData);

      expect(response.status).toBe(200);
      expect(response.body.data.toStage).toBe(1);
    });

    it('should validate progress action', async () => {
      const invalidProgress = {
        action: 'INVALID_ACTION',
        targetStageId: 'invalid-stage'
      };

      const response = await request(app)
        .post('/api/workflows/workflow-1/job-1/progress')
        .send(invalidProgress);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });
});
