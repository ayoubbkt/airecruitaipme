package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.dto.JobApplicationDTO;
import com.recruitpme.jobservice.dto.JobApplicationCreateDTO;
import com.recruitpme.jobservice.entity.JobApplication;
import com.recruitpme.jobservice.entity.JobApplication.ApplicationStatus;
import com.recruitpme.jobservice.exception.ResourceNotFoundException;
import com.recruitpme.jobservice.repository.JobApplicationRepository;
import com.recruitpme.jobservice.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional
    public JobApplicationDTO createApplication(JobApplicationCreateDTO applicationDTO) {
        jobRepository.findById(applicationDTO.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + applicationDTO.getJobId()));

        JobApplication application = JobApplication.builder()
                .jobId(applicationDTO.getJobId())
                .candidateId(applicationDTO.getCandidateId())
                .stageId(applicationDTO.getStageId())
                .status(ApplicationStatus.APPLIED)
                .answers(applicationDTO.getAnswers())
                .coverLetter(applicationDTO.getCoverLetter())
                .resumeUrl(applicationDTO.getResumeUrl())
                .source(applicationDTO.getSource())
                .lastStageChangeAt(LocalDateTime.now())
                .build();

        JobApplication savedApplication = applicationRepository.save(application);
        return mapToDTO(savedApplication);
    }

    @Override
    public JobApplicationDTO getApplicationById(Long id) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        return mapToDTO(application);
    }

    @Override
    public Page<JobApplicationDTO> getApplicationsByJob(Long jobId, Pageable pageable) {
        Page<JobApplication> applications = applicationRepository.findByJobId(jobId, pageable);
        return applications.map(this::mapToDTO);
    }

    @Override
    public List<JobApplicationDTO> getApplicationsByCandidate(Long candidateId) {
        List<JobApplication> applications = applicationRepository.findByCandidateId(candidateId);
        return applications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JobApplicationDTO updateApplicationStage(Long id, String stageId) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        application.setStageId(stageId);
        application.setLastStageChangeAt(LocalDateTime.now());

        JobApplication updatedApplication = applicationRepository.save(application);
        return mapToDTO(updatedApplication);
    }

    @Override
    @Transactional
    public JobApplicationDTO updateApplicationStatus(Long id, String status) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        application.setStatus(ApplicationStatus.valueOf(status.toUpperCase()));

        JobApplication updatedApplication = applicationRepository.save(application);
        return mapToDTO(updatedApplication);
    }

    @Override
    @Transactional
    public void deleteApplication(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found with id: " + id);
        }
        applicationRepository.deleteById(id);
    }

    private JobApplicationDTO mapToDTO(JobApplication application) {
        return JobApplicationDTO.builder()
                .id(application.getId())
                .jobId(application.getJobId())
                .candidateId(application.getCandidateId())
                .stageId(application.getStageId())
                .status(application.getStatus())
                .answers(application.getAnswers())
                .coverLetter(application.getCoverLetter())
                .resumeUrl(application.getResumeUrl())
                .source(application.getSource())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .lastStageChangeAt(application.getLastStageChangeAt())
                // Note: Candidate details would typically be fetched from a CV service
                .build();
    }
}