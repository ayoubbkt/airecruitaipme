package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobStatsDTO {
    private int inReview;
    private int inProgress;
    private int inInterview;
    private int offered;
    private int hired;
    private int rejected;
    private int total;
    private int evaluation;
    private int interview;
}