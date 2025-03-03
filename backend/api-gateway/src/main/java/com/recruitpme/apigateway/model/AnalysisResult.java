package com.recruitpme.apigateway.model;

import java.util.List;
import lombok.Data;

@Data
public class AnalysisResult {
    private List<String> skills;
    private String experience;
    private int score;
}