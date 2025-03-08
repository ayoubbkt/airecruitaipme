package com.recruitpme.jobservice.controller;

import com.recruitpme.jobservice.dto.JobCreateDTO;
import com.recruitpme.jobservice.dto.JobDetailDTO;
import com.recruitpme.jobservice.dto.JobListingDTO;
import com.recruitpme.jobservice.dto.JobSearchCriteriaDTO;
import com.recruitpme.jobservice.dto.JobStatsDTO;
import com.recruitpme.jobservice.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Slf4j
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<List<JobListingDTO>> getJobs(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        log.info("Fetching jobs with status: {}, page: {}, size: {}", status, page, size);
        List<JobListingDTO> jobs = jobService.getJobs(status, page, size);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/active")
    public ResponseEntity<List<JobListingDTO>> getActiveJobs() {
        log.info("Fetching active jobs");
        List<JobListingDTO> jobs = jobService.getActiveJobs();
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDetailDTO> getJobDetail(@PathVariable Long id) {
        log.info("Fetching job details for ID: {}", id);
        JobDetailDTO job = jobService.getJobDetail(id);
        return ResponseEntity.ok(job);
    }

    @PostMapping
    public ResponseEntity<JobDetailDTO> createJob(@Valid @RequestBody JobCreateDTO jobDto) {
        log.info("Creating new job: {}", jobDto.getTitle());
        JobDetailDTO createdJob = jobService.createJob(jobDto);
        return ResponseEntity.ok(createdJob);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobDetailDTO> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobCreateDTO jobDto) {
        
        log.info("Updating job with ID: {}", id);
        JobDetailDTO updatedJob = jobService.updateJob(id, jobDto);
        return ResponseEntity.ok(updatedJob);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        log.info("Deleting job with ID: {}", id);
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate-description")
    public ResponseEntity<String> generateJobDescription(
            @RequestParam String title,
            @RequestParam List<String> requirements) {
        
        log.info("Generating job description for title: {}", title);
        String description = jobService.generateJobDescription(title, requirements);
        return ResponseEntity.ok(description);
    }
    
    @PostMapping("/search")
    public ResponseEntity<List<JobDetailDTO>> searchJobs(@RequestBody JobSearchCriteriaDTO criteria) {
        log.info("Searching jobs with criteria: {}", criteria);
        List<JobDetailDTO> jobs = jobService.searchJobs(criteria);
        return ResponseEntity.ok(jobs);

    }
}