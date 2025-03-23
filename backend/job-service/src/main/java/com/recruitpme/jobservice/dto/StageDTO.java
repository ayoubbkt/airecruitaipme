package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StageDTO {
    private String id;
    private String name;
    private String type;
    private Integer dueDays;
    private Integer order;
    private Boolean visible;
}