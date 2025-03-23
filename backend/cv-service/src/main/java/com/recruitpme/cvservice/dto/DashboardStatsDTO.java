package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class DashboardStatsDTO {
    private int totalCandidates;
    private int totalJobs;
    private int activeJobs;
    private int newCandidatesThisWeek;
    private int interviewsScheduledThisWeek;
    private int averageCandidatesPerJob;
    private double averageTimeToHire;
    private List<Map<String, Object>> candidatesByStage;
    private List<Map<String, Object>> candidatesByScore;
    private List<Map<String, Object>> hiringActivity;
}