package com.recruitpme.jobservice.dto;

import com.recruitpme.jobservice.entity.JobApplication.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDTO {
    private Long id;
    private Long jobId;
    private Long candidateId;
    private String stageId;
    private ApplicationStatus status;
    private Map<String, String> answers = new HashMap<>();
    private String coverLetter;
    private String resumeUrl;
    private String source;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastStageChangeAt;

    // Candidate information
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String title;
    private Integer score;
}