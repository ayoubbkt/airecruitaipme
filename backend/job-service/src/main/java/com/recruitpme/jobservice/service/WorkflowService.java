package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.dto.*;

import java.util.List;

public interface WorkflowService {
    List<WorkflowDTO> getAllWorkflows();

    WorkflowDTO getWorkflowById(String id);

    WorkflowDTO createWorkflow(WorkflowCreateDTO workflowDto);

    WorkflowDTO updateWorkflow(String id, WorkflowCreateDTO workflowDto);

    void deleteWorkflow(String id);

    List<StageDTO> getWorkflowStages(String workflowId);

    StageDTO createWorkflowStage(String workflowId, StageCreateDTO stageDto);

    StageDTO updateWorkflowStage(String workflowId, String stageId, StageUpdateDTO stageDto);

    void deleteWorkflowStage(String workflowId, String stageId);

    WorkflowDTO getDefaultWorkflow();
}