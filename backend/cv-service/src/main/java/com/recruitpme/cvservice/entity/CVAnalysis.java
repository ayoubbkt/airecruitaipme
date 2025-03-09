package com.recruitpme.cvservice.entity;

import lombok.Data;


import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cv_analysis")
@Data
public class CVAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "cv_document_id")
    private CVDocument cvDocument;
    
    private Long jobId;
    
    private Integer score;
    
    @Column(columnDefinition = "TEXT")
    private String matchedSkills;
    
    @Column(columnDefinition = "TEXT")
    private String missingSkills;
    
    @Column(columnDefinition = "TEXT")
    private String strengths;
    
    @Column(columnDefinition = "TEXT")
    private String weaknesses;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String analysisDetails;
    
    private LocalDateTime createdAt;
}