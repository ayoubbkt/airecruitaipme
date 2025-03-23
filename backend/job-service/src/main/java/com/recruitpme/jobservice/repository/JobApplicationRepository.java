package com.recruitpme.jobservice.repository;

import com.recruitpme.jobservice.entity.JobApplication;
import com.recruitpme.jobservice.entity.JobApplication.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByJobId(Long jobId);

    Page<JobApplication> findByJobId(Long jobId, Pageable pageable);

    List<JobApplication> findByCandidateId(Long candidateId);

    Page<JobApplication> findByCandidateId(Long candidateId, Pageable pageable);

    Optional<JobApplication> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    List<JobApplication> findByJobIdAndStatus(Long jobId, ApplicationStatus status);

    List<JobApplication> findByJobIdAndStageId(Long jobId, String stageId);

    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.jobId = :jobId")
    Long countByJobId(@Param("jobId") Long jobId);

    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.jobId = :jobId AND a.status IN ('REVIEW', 'INTERVIEW')")
    Long countQualifiedByJobId(@Param("jobId") Long jobId);

    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.jobId = :jobId AND a.status = 'INTERVIEW'")
    Long countInterviewsByJobId(@Param("jobId") Long jobId);

    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.jobId = :jobId AND a.status = 'HIRED'")
    Long countHiredByJobId(@Param("jobId") Long jobId);

    @Query("SELECT a FROM JobApplication a WHERE a.jobId = :jobId ORDER BY a.createdAt DESC")
    List<JobApplication> findRecentApplicationsByJobId(@Param("jobId") Long jobId, Pageable pageable);
}