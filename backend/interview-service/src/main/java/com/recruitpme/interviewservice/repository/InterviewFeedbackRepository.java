package com.recruitpme.interviewservice.repository;

import com.recruitpme.interviewservice.entity.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {
    List<InterviewFeedback> findByInterviewId(Long interviewId);
    
    long countByInterviewId(Long interviewId);
    
    long countByRecommendationAndCreatedAtAfter(String recommendation, LocalDateTime date);
}