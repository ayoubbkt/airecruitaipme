package com.recruitpme.jobservice.repository;

import com.recruitpme.jobservice.entity.Job;
import com.recruitpme.jobservice.entity.Job.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    Page<Job> findByCompanyId(Long companyId, Pageable pageable);

    Long countByDepartmentAndStatusIs(String department, String status);

    Page<Job> findByCompanyIdAndStatus(Long companyId, JobStatus status, Pageable pageable);

    @Query("SELECT DISTINCT j.department FROM Job j WHERE j.companyId = :companyId")
    List<String> findDistinctDepartmentsByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT j FROM Job j WHERE j.title LIKE %:keyword% OR j.description LIKE %:keyword%")
    Page<Job> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.status = 'ACTIVE'")
    Long countActiveJobs();

    @Query("SELECT COUNT(j) FROM Job j WHERE j.companyId = :companyId AND j.status = 'ACTIVE'")
    Long countActiveJobsByCompany(@Param("companyId") Long companyId);
}