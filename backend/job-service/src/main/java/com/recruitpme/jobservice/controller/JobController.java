package com.recruitpme.jobservice.controller;

import com.recruitpme.jobservice.dto.*;
import com.recruitpme.jobservice.entity.Job.JobStatus;
import com.recruitpme.jobservice.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

//    @PostMapping
//    public ResponseEntity<JobDetailDTO> createJob(@Valid @RequestBody JobCreateDTO jobCreateDTO) {
//        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(jobCreateDTO));
//    }

    @PostMapping
    public ResponseEntity<?> createJob(@Valid @RequestBody JobCreateDTO jobCreateDTO, BindingResult result) {
        if (result.hasErrors()) {
            // Log les erreurs de validation
            for (FieldError error : result.getFieldErrors()) {
                System.err.println("Field: " + error.getField() + ", Message: " + error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body("Validation errors");
        }

        try {
            JobDetailDTO job = jobService.createJob(jobCreateDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(job);
        } catch (Exception e) {
            // Log l'exception
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }



    @GetMapping
    public ResponseEntity<List<JobListingDTO>> getJobs(@RequestParam(required = false) String status,
                                                       @PageableDefault(page = 0, size = 20) Pageable pageable) {
        JobStatus jobStatus = status != null ? JobStatus.valueOf(status.toUpperCase()) : null;
        return ResponseEntity.ok(jobService.getJobs(jobStatus, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDetailDTO> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobDetailDTO> updateJob(@PathVariable Long id, @Valid @RequestBody JobCreateDTO jobUpdateDTO) {
        return ResponseEntity.ok(jobService.updateJob(id, jobUpdateDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<JobListingDTO>> searchJobs(@ModelAttribute JobSearchCriteriaDTO criteria,
                                                          @PageableDefault(page = 0, size = 20) Pageable pageable) {
        return ResponseEntity.ok(jobService.searchJobs(criteria, pageable));
    }

    @PostMapping("/generate-description")
    public ResponseEntity<String> generateJobDescription(@RequestBody JobDescriptionRequestDTO request) {
        return ResponseEntity.ok(jobService.generateJobDescription(request));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentDTO>> getDepartments() {
        return ResponseEntity.ok(jobService.getDepartments());
    }

    @GetMapping("/skills")
    public ResponseEntity<List<JobSkillDTO>> getJobSkills(@RequestParam(required = false) String category) {
        if (category != null) {
            return ResponseEntity.ok(jobService.getJobSkillsByCategory(category));
        }
        return ResponseEntity.ok(jobService.getMostCommonJobSkills(20));
    }

    @GetMapping("/skills/categories")
    public ResponseEntity<List<String>> getSkillCategories() {
        return ResponseEntity.ok(jobService.getSkillCategories());
    }
}