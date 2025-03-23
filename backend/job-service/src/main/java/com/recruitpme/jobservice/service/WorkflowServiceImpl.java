package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.dto.*;
import com.recruitpme.jobservice.entity.Stage;
import com.recruitpme.jobservice.entity.Workflow;
import com.recruitpme.jobservice.exception.ResourceNotFoundException;
import com.recruitpme.jobservice.repository.StageRepository;
import com.recruitpme.jobservice.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl implements WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final StageRepository stageRepository;

    // Current company/user context would typically come from security context
    private String getCurrentCompanyId() {
        return "default-company"; // Placeholder implementation
    }

    @Override
    public List<WorkflowDTO> getAllWorkflows() {
        String companyId = getCurrentCompanyId();
        List<Workflow> workflows = workflowRepository.findByCompanyId(companyId);

        return workflows.stream()
                .map(this::convertToWorkflowDTO)
                .collect(Collectors.toList());
    }

    @Override
    public WorkflowDTO getWorkflowById(String id) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + id));

        return convertToWorkflowDTO(workflow);
    }

    @Override
    @Transactional
    public WorkflowDTO createWorkflow(WorkflowCreateDTO workflowDto) {
        String companyId = getCurrentCompanyId();

        // Create new workflow
        Workflow workflow = new Workflow();
        workflow.setId(UUID.randomUUID().toString());
        workflow.setName(workflowDto.getName());
        workflow.setDescription(workflowDto.getDescription());
        workflow.setDefault(workflowDto.isDefault());
        workflow.setCompanyId(companyId);

        // If this is marked as default, unmark any existing default
        if (workflow.isDefault()) {
            workflowRepository.findByCompanyIdAndIsDefaultTrue(companyId)
                    .ifPresent(existingDefault -> {
                        existingDefault.setDefault(false);
                        workflowRepository.save(existingDefault);
                    });
        }

        // Save workflow
        Workflow savedWorkflow = workflowRepository.save(workflow);

        // Create default stages if none provided
        if (workflowDto.getStages() == null || workflowDto.getStages().isEmpty()) {
            createDefaultStages(savedWorkflow);
        } else {
            // Create stages from provided list
            int order = 0;
            for (StageCreateDTO stageDto : workflowDto.getStages()) {
                Stage stage = new Stage();
                stage.setId(UUID.randomUUID().toString());
                stage.setName(stageDto.getName());
                stage.setType(stageDto.getType());
                stage.setDueDays(stageDto.getDueDays());
                stage.setOrder(order++);
                stage.setVisible(stageDto.isVisible());
                stage.setWorkflow(savedWorkflow);

                stageRepository.save(stage);
            }
        }

        return convertToWorkflowDTO(savedWorkflow);
    }

    @Override
    @Transactional
    public WorkflowDTO updateWorkflow(String id, WorkflowCreateDTO workflowDto) {
        String companyId = getCurrentCompanyId();

        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + id));

        // Update basic workflow info
        workflow.setName(workflowDto.getName());
        workflow.setDescription(workflowDto.getDescription());

        // Handle default status change
        if (workflowDto.isDefault() && !workflow.isDefault()) {
            // If this is being marked as default, unmark any existing default
            workflowRepository.findByCompanyIdAndIsDefaultTrue(companyId)
                    .ifPresent(existingDefault -> {
                        existingDefault.setDefault(false);
                        workflowRepository.save(existingDefault);
                    });
            workflow.setDefault(true);
        } else if (!workflowDto.isDefault() && workflow.isDefault()) {
            // If this is being unmarked as default, ensure there is another default or prevent the change
            long defaultsCount = workflowRepository.findByCompanyId(companyId).stream()
                    .filter(Workflow::isDefault)
                    .count();

            if (defaultsCount <= 1) {
                // Cannot remove default status if this is the only default
                workflow.setDefault(true);
            } else {
                workflow.setDefault(false);
            }
        }

        Workflow updatedWorkflow = workflowRepository.save(workflow);

        return convertToWorkflowDTO(updatedWorkflow);
    }

    @Override
    @Transactional
    public void deleteWorkflow(String id) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + id));

        // Cannot delete the default workflow
        if (workflow.isDefault()) {
            throw new IllegalStateException("Cannot delete the default workflow");
        }

        // Delete all associated stages
        stageRepository.deleteByWorkflowId(id);

        // Delete the workflow
        workflowRepository.delete(workflow);
    }

    @Override
    public List<StageDTO> getWorkflowStages(String workflowId) {
        // Special case for "default" - return the default workflow's stages
        if ("default".equals(workflowId)) {
            Workflow defaultWorkflow = workflowRepository.findByCompanyIdAndIsDefaultTrue(getCurrentCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Default workflow not found"));
            workflowId = defaultWorkflow.getId();
        }

        // Verify workflow exists
        String finalWorkflowId = workflowId;
        workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + finalWorkflowId));

        // Get stages ordered by their sequence
        List<Stage> stages = stageRepository.findByWorkflowIdOrderByOrder(workflowId);

        return stages.stream()
                .map(this::convertToStageDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StageDTO createWorkflowStage(String workflowId, StageCreateDTO stageDto) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + workflowId));

        // Find max order and place new stage after it
        int maxOrder = stageRepository.findByWorkflowIdOrderByOrder(workflowId).stream()
                .mapToInt(Stage::getOrder)
                .max()
                .orElse(-1);

        Stage stage = new Stage();
        stage.setId(UUID.randomUUID().toString());
        stage.setName(stageDto.getName());
        stage.setType(stageDto.getType());
        stage.setDueDays(stageDto.getDueDays());
        stage.setOrder(maxOrder + 1);
        stage.setVisible(stageDto.isVisible());
        stage.setWorkflow(workflow);

        Stage savedStage = stageRepository.save(stage);

        return convertToStageDTO(savedStage);
    }

    @Override
    @Transactional
    public StageDTO updateWorkflowStage(String workflowId, String stageId, StageUpdateDTO stageDto) {
        // Verify workflow exists
        workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + workflowId));

        // Find stage
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new ResourceNotFoundException("Stage not found with id: " + stageId));

        // Verify stage belongs to workflow
        if (!stage.getWorkflow().getId().equals(workflowId)) {
            throw new IllegalArgumentException("Stage does not belong to the specified workflow");
        }

        // Update stage
        stage.setName(stageDto.getName());
        stage.setType(stageDto.getType());
        stage.setDueDays(stageDto.getDueDays());
        stage.setVisible(stageDto.isVisible());

        Stage updatedStage = stageRepository.save(stage);

        return convertToStageDTO(updatedStage);
    }

    @Override
    @Transactional
    public void deleteWorkflowStage(String workflowId, String stageId) {
        // Verify workflow exists
        workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + workflowId));

        // Find stage
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new ResourceNotFoundException("Stage not found with id: " + stageId));

        // Verify stage belongs to workflow
        if (!stage.getWorkflow().getId().equals(workflowId)) {
            throw new IllegalArgumentException("Stage does not belong to the specified workflow");
        }

        // Delete stage
        stageRepository.delete(stage);

        // Reorder remaining stages
        List<Stage> remainingStages = stageRepository.findByWorkflowIdOrderByOrder(workflowId);
        for (int i = 0; i < remainingStages.size(); i++) {
            Stage remainingStage = remainingStages.get(i);
            remainingStage.setOrder(i);
            stageRepository.save(remainingStage);
        }
    }

    @Override
    public WorkflowDTO getDefaultWorkflow() {
        String companyId = getCurrentCompanyId();
        Workflow defaultWorkflow = workflowRepository.findByCompanyIdAndIsDefaultTrue(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Default workflow not found"));

        return convertToWorkflowDTO(defaultWorkflow);
    }

    private void createDefaultStages(Workflow workflow) {
        String[] defaultStageNames = {
                "Leads", "Applied", "Shortlist", "Interview", "Offer", "Hired", "Rejected"
        };
        String[] defaultStageTypes = {
                "lead", "applied", "review", "interview", "offer", "hired", "rejected"
        };
        Integer[] defaultDueDays = {
                3, 3, 7, 14, 7, null, null
        };

        for (int i = 0; i < defaultStageNames.length; i++) {
            Stage stage = new Stage();
            stage.setId(UUID.randomUUID().toString());
            stage.setName(defaultStageNames[i]);
            stage.setType(defaultStageTypes[i]);
            stage.setDueDays(defaultDueDays[i]);
            stage.setOrder(i);
            stage.setVisible(true);
            stage.setWorkflow(workflow);

            stageRepository.save(stage);
        }
    }

    private WorkflowDTO convertToWorkflowDTO(Workflow workflow) {
        WorkflowDTO dto = new WorkflowDTO();
        dto.setId(workflow.getId());
        dto.setName(workflow.getName());
        dto.setDescription(workflow.getDescription());
        dto.setDefault(workflow.isDefault());
        dto.setStageCount(stageRepository.countByWorkflowId(workflow.getId()));
        dto.setCreatedAt(workflow.getCreatedAt());
        dto.setUpdatedAt(workflow.getUpdatedAt());

        // Optionally load stages if needed
        List<Stage> stages = stageRepository.findByWorkflowIdOrderByOrder(workflow.getId());
        if (!stages.isEmpty()) {
            dto.setStages(stages.stream()
                    .map(this::convertToStageDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private StageDTO convertToStageDTO(Stage stage) {
        StageDTO dto = new StageDTO();
        dto.setId(stage.getId());
        dto.setName(stage.getName());
        dto.setType(stage.getType());
        dto.setDueDays(stage.getDueDays());
        dto.setOrder(stage.getOrder());
        dto.setVisible(stage.getVisible());
        return dto;
    }
}