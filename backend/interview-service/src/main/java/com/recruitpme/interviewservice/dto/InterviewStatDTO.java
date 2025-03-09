package com.recruitpme.interviewservice.dto;

import lombok.Data;


@Data
public class InterviewStatDTO {
    private int scheduledCount;
    private int completedCount;
    private int cancelledCount;
    private int hireRecommendations;
    private int considerRecommendations;
    private int rejectRecommendations;
}