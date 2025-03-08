package com.recruitpme.interviewservice.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_feedbacks")
@Data
public class InterviewFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "interview_id")
    private Interview interview;
    
    private String interviewer;
    
    private Integer technicalScore;
    
    private Integer behavioralScore;
    
    private String recommendation; // HIRE, CONSIDER, REJECT
    
    @Column(columnDefinition = "TEXT")
    private String comments;
    
    @Column(columnDefinition = "TEXT")
    private String skillFeedback; // JSON string of skill assessments
    
    private LocalDateTime createdAt;
}