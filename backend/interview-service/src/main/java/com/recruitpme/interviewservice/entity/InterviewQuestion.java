package com.recruitpme.interviewservice.entity;

import lombok.Data;

import javax.persistence.*;



@Entity
@Table(name = "interview_questions")
@Data
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "interview_id")
    private Interview interview;
    
    @Column(columnDefinition = "TEXT")
    private String question;
    
    @Column(columnDefinition = "TEXT")
    private String rationale;
    
    private String category; // TECHNICAL, BEHAVIORAL, JOB_SPECIFIC
    
    private Integer orderIndex;
}