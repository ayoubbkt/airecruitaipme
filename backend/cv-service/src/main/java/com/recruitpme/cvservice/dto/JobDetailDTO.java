package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobDetailDTO {
    private String id;
    private String title;
    private String description;
    private String location;
    private String jobType;
    private String workType;
    private String department;
    private String status;
    private String salaryRange;
    private int minYearsExperience;
    private List<JobSkillDTO> requiredSkills;
    private List<JobSkillDTO> preferredSkills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}