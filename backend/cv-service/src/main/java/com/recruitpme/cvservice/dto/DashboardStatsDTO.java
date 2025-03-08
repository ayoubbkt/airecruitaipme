package com.recruitpme.cvservice.dto;

import lombok.Data;

@Data
public class DashboardStatsDTO {
    private int analyzedCVs;
    private int analyzedCVsPercentChange;
    private int qualifiedCandidates;
    private int qualifiedCandidatesPercentChange;
    private int scheduledInterviews;
    private int scheduledInterviewsPercentChange;
    private int timeToHire;
    private int timeToHireChange;
}