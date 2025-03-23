package com.recruitpme.jobservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "stage_id")
    private String stageId;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    @ElementCollection
    @CollectionTable(name = "job_application_answers",
            joinColumns = @JoinColumn(name = "application_id"))
    @MapKeyColumn(name = "question_id")
    @Column(name = "answer")
    private Map<String, String> answers = new HashMap<>();

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "source")
    private String source;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_stage_change_at")
    private LocalDateTime lastStageChangeAt;

    public enum ApplicationStatus {
        APPLIED, REVIEW, INTERVIEW, OFFER, HIRED, REJECTED, WITHDRAWN
    }
}