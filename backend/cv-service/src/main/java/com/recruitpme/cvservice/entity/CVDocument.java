package com.recruitpme.cvservice.entity;

import lombok.Data;


import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cv_documents")
@Data
public class CVDocument {

    @Id
    private String id;
    
    private String filename;
    
    private String contentType;
    
    private Long size;
    
    private Long jobId;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private LocalDateTime uploadedAt;
}