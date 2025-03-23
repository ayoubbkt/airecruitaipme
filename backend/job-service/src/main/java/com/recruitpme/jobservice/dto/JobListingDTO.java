package com.recruitpme.jobservice.dto;

import com.recruitpme.jobservice.entity.Job.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobListingDTO {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String jobType;
    private String workType;
    private Integer minYearsExperience;
    private String salaryRange;
    private String department;
    private JobStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime postedAt;
    private boolean isPublished;
    private boolean isInternal;
    private boolean isConfidential;
    private int applicationsCount;
    private JobStatsDTO metrics;
    private int daysAgo;
}