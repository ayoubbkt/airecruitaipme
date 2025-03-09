package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.dto.JobApplicationDTO;
import java.util.List;


public interface JobApplicationService {
    List<JobApplicationDTO> getApplicationsByJob(Long jobId);
    
    List<JobApplicationDTO> getApplicationsByCandidate(String candidateId);
    
    JobApplicationDTO getApplicationById(Long id);
    
    JobApplicationDTO createApplication(JobApplicationDTO applicationDto);
    
    JobApplicationDTO updateApplicationStatus(Long id, String status);
    
    JobApplicationDTO addApplicationNotes(Long id, String notes);
}