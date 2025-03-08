package com.recruitpme.interviewservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InterviewDetailDTO {
    private Long id;
    private String candidateId;
    private Long jobId;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String jobTitle;
    private String interviewType;
    private LocalDateTime scheduledTime;
    private Integer duration;
    private String location;
    private List<String> interviewers;
    private String notes;
    private String status;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}