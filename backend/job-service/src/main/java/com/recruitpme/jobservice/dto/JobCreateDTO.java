package com.recruitpme.jobservice.dto;

import com.recruitpme.jobservice.entity.JobBoard;
import com.recruitpme.jobservice.entity.JobQuestion;
import com.recruitpme.jobservice.entity.TeamMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCreateDTO {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Job type is required")
    private String jobType;

    private String workType;

    private Integer minYearsExperience;

    private String salaryRange;

    private String department;

    private String jobCode;

    private String status;

    private List<String> requiredSkills = new ArrayList<>();

    private List<String> preferredSkills = new ArrayList<>();

    private Map<String, Boolean> applicationFields = new HashMap<>();

    private List<JobQuestion> customQuestions = new ArrayList<>();

    private List<TeamMember> hiringTeam = new ArrayList<>();

    private String workflowId;

    private List<JobBoard> jobBoards = new ArrayList<>();
}