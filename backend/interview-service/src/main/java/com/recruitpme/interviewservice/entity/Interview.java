package com.recruitpme.interviewservice.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Data
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String candidateId;
    
    private Long jobId;
    
    private String interviewType; // VIDEO, PHONE, IN_PERSON
    
    private LocalDateTime scheduledTime;
    
    private Integer duration; // in minutes
    
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String interviewers; // Comma-separated list of interviewer IDs
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private String status; // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    
    @Column(columnDefinition = "TEXT")
    private String cancellationReason;
    
    private String outcome; // HIRED, REJECTED, PENDING

    private LocalDateTime completedAt;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}