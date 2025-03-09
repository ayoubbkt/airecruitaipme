package com.recruitpme.jobservice.repository;

import com.recruitpme.jobservice.entity.JobSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, Long> {
    List<JobSkill> findByJobId(Long jobId);
    
    List<JobSkill> findByJobIdAndRequired(Long jobId, boolean required);
    
    void deleteByJobId(Long jobId);
}