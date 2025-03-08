package com.recruitpme.interviewservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobDetailDTO {
    private Long id;
    private String title;
    private String description;
    private List<String> requiredSkills;
    private List<String> preferredSkills;
    private String location;
    private String jobType;
    private Integer minYearsExperience;
    private String salaryRange;
    private String department;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}