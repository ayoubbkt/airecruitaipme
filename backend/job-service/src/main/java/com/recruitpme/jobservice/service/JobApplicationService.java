package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.dto.JobApplicationDTO;
import com.recruitpme.jobservice.dto.JobApplicationCreateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface JobApplicationService {

    JobApplicationDTO createApplication(JobApplicationCreateDTO applicationDTO);

    JobApplicationDTO getApplicationById(Long id);

    Page<JobApplicationDTO> getApplicationsByJob(Long jobId, Pageable pageable);

    List<JobApplicationDTO> getApplicationsByCandidate(Long candidateId);

    JobApplicationDTO updateApplicationStage(Long id, String stageId);

    JobApplicationDTO updateApplicationStatus(Long id, String status);

    void deleteApplication(Long id);
}