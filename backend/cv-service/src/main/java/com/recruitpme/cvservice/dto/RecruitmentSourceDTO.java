package com.recruitpme.cvservice.dto;

import lombok.Data;

@Data
public class RecruitmentSourceDTO {
    private String source;
    private int count;
    private double percentage;
}