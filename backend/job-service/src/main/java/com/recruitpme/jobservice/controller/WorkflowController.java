package com.recruitpme.jobservice.controller;

import com.recruitpme.jobservice.dto.*;
import com.recruitpme.jobservice.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    @GetMapping
    public ResponseEntity<List<WorkflowDTO>> getAllWorkflows() {
        List<WorkflowDTO> workflows = workflowService.getAllWorkflows();
        return ResponseEntity.ok(workflows);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkflowDTO> getWorkflowById(@PathVariable String id) {
        WorkflowDTO workflow = workflowService.getWorkflowById(id);
        return ResponseEntity.ok(workflow);
    }

    @GetMapping("/default")
    public ResponseEntity<WorkflowDTO> getDefaultWorkflow() {
        WorkflowDTO workflow = workflowService.getDefaultWorkflow();
        return ResponseEntity.ok(workflow);
    }

    @PostMapping
    public ResponseEntity<WorkflowDTO> createWorkflow(@Valid @RequestBody WorkflowCreateDTO workflowDto) {
        WorkflowDTO createdWorkflow = workflowService.createWorkflow(workflowDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWorkflow);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkflowDTO> updateWorkflow(
            @PathVariable String id,
            @Valid @RequestBody WorkflowCreateDTO workflowDto) {

        WorkflowDTO updatedWorkflow = workflowService.updateWorkflow(id, workflowDto);
        return ResponseEntity.ok(updatedWorkflow);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable String id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{workflowId}/stages")
    public ResponseEntity<List<StageDTO>> getWorkflowStages(@PathVariable String workflowId) {
        List<StageDTO> stages = workflowService.getWorkflowStages(workflowId);
        return ResponseEntity.ok(stages);
    }

    @PostMapping("/{workflowId}/stages")
    public ResponseEntity<StageDTO> createWorkflowStage(
            @PathVariable String workflowId,
            @Valid @RequestBody StageCreateDTO stageDto) {

        StageDTO createdStage = workflowService.createWorkflowStage(workflowId, stageDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStage);
    }

    @PutMapping("/{workflowId}/stages/{stageId}")
    public ResponseEntity<StageDTO> updateWorkflowStage(
            @PathVariable String workflowId,
            @PathVariable String stageId,
            @Valid @RequestBody StageUpdateDTO stageDto) {

        StageDTO updatedStage = workflowService.updateWorkflowStage(workflowId, stageId, stageDto);
        return ResponseEntity.ok(updatedStage);
    }

    @DeleteMapping("/{workflowId}/stages/{stageId}")
    public ResponseEntity<Void> deleteWorkflowStage(
            @PathVariable String workflowId,
            @PathVariable String stageId) {

        workflowService.deleteWorkflowStage(workflowId, stageId);
        return ResponseEntity.noContent().build();
    }
}