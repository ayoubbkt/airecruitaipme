package com.recruitpme.jobservice.entity;

import lombok.Data;

import javax.persistence.*;

@Entity
@Table(name = "job_skills")
@Data
public class JobSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;
    
    private String name;
    
    private boolean required;
    
    private int importance; // 1-10 scale
}