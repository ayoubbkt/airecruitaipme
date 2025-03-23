package com.recruitpme.cvservice.dto;

import lombok.Data;

@Data
public class SkillAnalysisDTO {
    private String name;
    private boolean matched;
    private int confidence;
}