package com.recruitpme.jobservice.dto;

import com.recruitpme.jobservice.entity.Job.JobStatus;
import com.recruitpme.jobservice.entity.JobBoard;
import com.recruitpme.jobservice.entity.JobQuestion;
import com.recruitpme.jobservice.entity.TeamMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDetailDTO {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String jobType;
    private String workType;
    private Integer minYearsExperience;
    private String salaryRange;
    private String department;
    private String jobCode;
    private JobStatus status;
    private List<String> requiredSkills = new ArrayList<>();
    private List<String> preferredSkills = new ArrayList<>();
    private Map<String, Boolean> applicationFields = new HashMap<>();
    private List<JobQuestion> customQuestions = new ArrayList<>();
    private List<TeamMember> hiringTeam = new ArrayList<>();
    private String workflowId;
    private List<JobBoard> jobBoards = new ArrayList<>();
    private Long companyId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime postedAt;
    private LocalDateTime expiresAt;
    private JobStatsDTO metrics;
    private List<JobApplicationDTO> recentApplications;
    private boolean isPublished;
    private int applicationsCount;
    private int qualifiedCandidatesCount;
    private int interviewsCount;
    private int hiredCount;
}