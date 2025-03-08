package com.recruitpme.jobservice.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String requirements;
    
    @Column(columnDefinition = "TEXT")
    private String preferredSkills;
    
    private String location;
    
    private String jobType; // FULL_TIME, PART_TIME, CONTRACT, etc.
    
    private Integer minYearsExperience;
    
    private String salaryRange;
    
    private String department;
    
    private String status; // ACTIVE, FILLED, DELETED, etc.
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}