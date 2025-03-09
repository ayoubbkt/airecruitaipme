package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.dto.JobApplicationDTO;
import com.recruitpme.jobservice.entity.Job;
import com.recruitpme.jobservice.entity.JobApplication;
import com.recruitpme.jobservice.exception.ResourceNotFoundException;
import com.recruitpme.jobservice.repository.JobApplicationRepository;
import com.recruitpme.jobservice.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationDTO> getApplicationsByJob(Long jobId) {
        List<JobApplication> applications = jobApplicationRepository.findByJobId(jobId);
        
        return applications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationDTO> getApplicationsByCandidate(String candidateId) {
        List<JobApplication> applications = jobApplicationRepository.findByCandidateId(candidateId);
        
        return applications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationDTO getApplicationById(Long id) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        
        return convertToDTO(application);
    }

    @Override
    @Transactional
    public JobApplicationDTO createApplication(JobApplicationDTO applicationDto) {
        // Verify job exists
        Job job = jobRepository.findById(applicationDto.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + applicationDto.getJobId()));
        
        // Check if application already exists
        List<JobApplication> existingApplications = jobApplicationRepository.findByJobIdAndCandidateId(
                applicationDto.getJobId(), applicationDto.getCandidateId());
        
        if (!existingApplications.isEmpty()) {
            throw new IllegalStateException("Candidate has already applied for this job");
        }
        
        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setCandidateId(applicationDto.getCandidateId());
        application.setStatus("APPLIED");
        application.setScore(applicationDto.getScore());
        application.setNotes(applicationDto.getNotes());
        application.setAppliedAt(LocalDateTime.now());
        
        JobApplication savedApplication = jobApplicationRepository.save(application);
        
        return convertToDTO(savedApplication);
    }

    @Override
    @Transactional
    public JobApplicationDTO updateApplicationStatus(Long id, String status) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        
        application.setStatus(status);
        application.setUpdatedAt(LocalDateTime.now());
        
        // If status is HIRED, update job status to FILLED
        if ("HIRED".equals(status)) {
            Job job = application.getJob();
            job.setStatus("FILLED");
            job.setUpdatedAt(LocalDateTime.now());
            jobRepository.save(job);
        }
        
        JobApplication updatedApplication = jobApplicationRepository.save(application);
        
        return convertToDTO(updatedApplication);
    }

    @Override
    @Transactional
    public JobApplicationDTO addApplicationNotes(Long id, String notes) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        
        application.setNotes(notes);
        application.setUpdatedAt(LocalDateTime.now());
        
        JobApplication updatedApplication = jobApplicationRepository.save(application);
        
        return convertToDTO(updatedApplication);
    }
    
    private JobApplicationDTO convertToDTO(JobApplication application) {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setId(application.getId());
        dto.setJobId(application.getJob().getId());
        dto.setJobTitle(application.getJob().getTitle());
        dto.setCandidateId(application.getCandidateId());
        dto.setStatus(application.getStatus());
        dto.setScore(application.getScore());
        dto.setNotes(application.getNotes());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setUpdatedAt(application.getUpdatedAt());
        
        return dto;
    }
}