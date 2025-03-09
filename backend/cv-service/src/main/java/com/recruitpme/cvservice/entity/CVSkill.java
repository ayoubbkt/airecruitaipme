package com.recruitpme.cvservice.entity;

import lombok.Data;


import javax.persistence.*;

@Entity
@Table(name = "cv_skills")
@Data
public class CVSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "cv_document_id")
    private CVDocument cvDocument;
    
    private String name;
    
    private String category;
    
    private Integer confidenceScore;
}