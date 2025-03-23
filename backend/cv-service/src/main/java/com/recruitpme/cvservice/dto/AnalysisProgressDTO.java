package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class AnalysisProgressDTO {
    private String analysisId;
    private int progress;
    private boolean completed;
    private List<CVAnalysisResponseDTO> results;
    private AnalysisStatsDTO stats;
}