package com.recruitpme.interviewservice.repository;

import com.recruitpme.interviewservice.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByStatus(String status);
    
    List<Interview> findByScheduledTimeBetween(LocalDateTime start, LocalDateTime end);
    
    List<Interview> findByStatusAndScheduledTimeBetween(String status, LocalDateTime start, LocalDateTime end);
    
    long countByStatusAndScheduledTimeAfter(String status, LocalDateTime date);
    
    long countByStatusAndCompletedAtAfter(String status, LocalDateTime date);
    
    long countByStatusAndUpdatedAtAfter(String status, LocalDateTime date);
}