package com.recruitpme.cvservice.dto;

import lombok.Data;

@Data
public class AnalysisStatsDTO {
    private int skillsDetected;
    private int recommendedCandidates;
    private String topCandidateName;
    private int topCandidateScore;
}