package com.recruitpme.jobservice.repository;

import com.recruitpme.jobservice.entity.Job;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    
    List<Job> findByStatusOrderByCreatedAtDesc(String status);
    
    List<Job> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    
    List<Job> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    long countByStatusEquals(String status);
    
    boolean existsByTitle(String title);
}