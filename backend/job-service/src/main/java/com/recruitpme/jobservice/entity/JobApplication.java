package com.recruitpme.jobservice.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "job_applications")
@Data
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;
    
    private String candidateId;
    
    private String status; // APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
    
    private Integer score;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private LocalDateTime appliedAt;
    
    private LocalDateTime updatedAt;
}