package com.recruitpme.jobservice.controller;

import com.recruitpme.jobservice.dto.JobApplicationDTO;
import com.recruitpme.jobservice.dto.JobApplicationCreateDTO;
import com.recruitpme.jobservice.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService applicationService;

    @PostMapping
    public ResponseEntity<JobApplicationDTO> createApplication(@Valid @RequestBody JobApplicationCreateDTO applicationDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.createApplication(applicationDTO));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<Page<JobApplicationDTO>> getApplicationsByJob(
            @PathVariable Long jobId,
            @PageableDefault(page = 0, size = 20) Pageable pageable) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId, pageable));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsByCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(applicationService.getApplicationsByCandidate(candidateId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @PutMapping("/{id}/stage")
    public ResponseEntity<JobApplicationDTO> updateApplicationStage(
            @PathVariable Long id,
            @RequestParam String stageId) {
        return ResponseEntity.ok(applicationService.updateApplicationStage(id, stageId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<JobApplicationDTO> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}