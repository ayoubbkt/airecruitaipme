package com.recruitpme.jobservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class JobApplicationDTO {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String candidateId;
    private String candidateName;
    private String status;
    private Integer score;
    private String notes;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}