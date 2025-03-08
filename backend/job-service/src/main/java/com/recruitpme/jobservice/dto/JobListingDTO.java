package com.recruitpme.jobservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class JobListingDTO {
    private Long id;
    private String title;
    private String location;
    private String jobType;
    private String salaryRange;
    private String department;
    private String status;
    private LocalDateTime createdAt;
    private int applications;
}