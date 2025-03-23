package com.recruitpme.interviewservice.dto;

import lombok.Data;

import java.time.LocalDateTime;



@Data
public class InterviewListDTO {
    private Long id;
    private String candidateId;
    private Long jobId;
    private String candidateName;
    private String jobTitle;
    private String interviewType;
    private LocalDateTime scheduledTime;
    private Integer duration;
    private String status;
}