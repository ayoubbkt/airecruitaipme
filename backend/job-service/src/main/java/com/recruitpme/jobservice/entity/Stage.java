package com.recruitpme.jobservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "stages")
public class Stage {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String type;

    @Column(name = "due_days")
    private Integer dueDays;

    @Column(name = "stage_order")
    private Integer order;

    private Boolean visible;

    @ManyToOne
    @JoinColumn(name = "workflow_id", nullable = false)
    private Workflow workflow;
}