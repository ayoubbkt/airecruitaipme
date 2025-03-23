package com.recruitpme.jobservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;
import lombok.Builder;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "job_questions")
public class JobQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String text;

    @Column(name = "response_type")
    private String responseType;

    @Column(name = "visibility")
    private String visibility;

    @Column(name = "question_set_id")
    private String questionSetId;

    @Column(name = "question_id")
    private String questionId;

    @Column(name = "job_id")
    private Long jobId;



    @Column(name = "is_optional")
    private Boolean isOptional;
    @Column(name = "question_order")
    private Integer order;
}