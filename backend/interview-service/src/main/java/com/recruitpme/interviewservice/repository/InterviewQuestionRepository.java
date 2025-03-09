package com.recruitpme.interviewservice.repository;

import com.recruitpme.interviewservice.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByInterviewIdOrderByOrderIndexAsc(Long interviewId);
    
    void deleteByInterviewId(Long interviewId);
}