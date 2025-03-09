package com.recruitpme.jobservice.controller;

import com.recruitpme.jobservice.dto.JobApplicationDTO;
import com.recruitpme.jobservice.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-applications")
@RequiredArgsConstructor
@Slf4j
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsByJob(@PathVariable Long jobId) {
        log.info("Fetching applications for job ID: {}", jobId);
        List<JobApplicationDTO> applications = jobApplicationService.getApplicationsByJob(jobId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsByCandidate(@PathVariable String candidateId) {
        log.info("Fetching applications for candidate ID: {}", candidateId);
        List<JobApplicationDTO> applications = jobApplicationService.getApplicationsByCandidate(candidateId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> getApplicationById(@PathVariable Long id) {
        log.info("Fetching application with ID: {}", id);
        JobApplicationDTO application = jobApplicationService.getApplicationById(id);
        return ResponseEntity.ok(application);
    }

    @PostMapping
    public ResponseEntity<JobApplicationDTO> createApplication(@Valid @RequestBody JobApplicationDTO applicationDto) {
        log.info("Creating application for job ID: {} and candidate ID: {}", 
                applicationDto.getJobId(), applicationDto.getCandidateId());
        JobApplicationDTO createdApplication = jobApplicationService.createApplication(applicationDto);
        return ResponseEntity.ok(createdApplication);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<JobApplicationDTO> updateApplicationStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> statusUpdate) {
        
        String status = statusUpdate.get("status");
        log.info("Updating application status for ID: {} to {}", id, status);
        JobApplicationDTO updatedApplication = jobApplicationService.updateApplicationStatus(id, status);
        return ResponseEntity.ok(updatedApplication);
    }

    @PutMapping("/{id}/notes")
    public ResponseEntity<JobApplicationDTO> addApplicationNotes(
            @PathVariable Long id, 
            @RequestBody Map<String, String> notesUpdate) {
        
        String notes = notesUpdate.get("notes");
        log.info("Adding notes to application ID: {}", id);
        JobApplicationDTO updatedApplication = jobApplicationService.addApplicationNotes(id, notes);
        return ResponseEntity.ok(updatedApplication);
    }
}