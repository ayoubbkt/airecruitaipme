package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class CVSearchCriteriaDTO {
    private String keyword;
    private List<String> skills;
    private Integer minYearsExperience;
    private Integer minScore;
    private String location;
    private List<String> jobTitles;
}