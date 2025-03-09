package com.recruitpme.jobservice.repository;

import com.recruitpme.jobservice.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByJobId(Long jobId);
    
    List<JobApplication> findByCandidateId(String candidateId);
    
    List<JobApplication> findByJobIdAndCandidateId(Long jobId, String candidateId);
    
    List<JobApplication> findByJobIdAndStatus(Long jobId, String status);
    
    long countByJobId(Long jobId);
    
    long countByJobIdAndStatus(Long jobId, String status);
    
    long countByStatusEquals(String status);
    
    long countByStatusIn(List<String> statuses);
}