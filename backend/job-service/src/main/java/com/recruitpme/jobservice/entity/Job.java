package com.recruitpme.jobservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;

    @Column(name = "job_type")
    private String jobType; // full-time, part-time, contract, etc.

    @Column(name = "work_type")
    private String workType; // on-site, remote, hybrid

    @Column(name = "min_years_experience")
    private Integer minYearsExperience;

    @Column(name = "salary_range")
    private String salaryRange;

    private String department;

    @Column(name = "job_code")
    private String jobCode;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    @Column(name = "workflow_id")
    private String workflowId;

    @ElementCollection
    @CollectionTable(name = "job_required_skills",
            joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> requiredSkills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "job_preferred_skills",
            joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> preferredSkills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "job_application_fields",
            joinColumns = @JoinColumn(name = "job_id"))
    @MapKeyColumn(name = "field_name")
    @Column(name = "is_required")
    private Map<String, Boolean> applicationFields = new HashMap<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "job_id")
    private List<JobQuestion> customQuestions = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "job_hiring_team",
            joinColumns = @JoinColumn(name = "job_id"))
    @AttributeOverrides({
            @AttributeOverride(name = "email", column = @Column(name = "email")),
            @AttributeOverride(name = "role", column = @Column(name = "role"))
    })
    private List<TeamMember> hiringTeam = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "job_job_boards",
            joinColumns = @JoinColumn(name = "job_id"))
    @AttributeOverrides({
            @AttributeOverride(name = "id", column = @Column(name = "board_id")),
            @AttributeOverride(name = "price", column = @Column(name = "price"))
    })
    private List<JobBoard> jobBoards = new ArrayList<>();

    @Column(name = "company_id")
    private Long companyId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "posted_at")
    private LocalDateTime postedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public enum JobStatus {
        DRAFT, ACTIVE, PAUSED, ARCHIVED, INTERNAL, CONFIDENTIAL
    }
}