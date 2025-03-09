package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.dto.*;

import java.util.List;


public interface JobService {
    List<JobListingDTO> getJobs(String status, int page, int size);
    
    List<JobListingDTO> getActiveJobs();
    
    JobDetailDTO getJobDetail(Long id);
    
    JobDetailDTO createJob(JobCreateDTO jobDto);
    
    JobDetailDTO updateJob(Long id, JobCreateDTO jobDto);
    
    void deleteJob(Long id);
    
    String generateJobDescription(String title, List<String> requirements);
    
    List<JobDetailDTO> searchJobs(JobSearchCriteriaDTO criteria);
    
    JobStatsDTO getJobStats();
}