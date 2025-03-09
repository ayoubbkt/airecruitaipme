package com.recruitpme.jobservice.dto;

import lombok.Data;

import java.util.List;


@Data
public class JobSearchCriteriaDTO {
    private String keyword;
    private List<String> locations;
    private List<String> jobTypes;
    private String department;
    private Integer minYearsExperience;
    private Integer maxYearsExperience;
    private String status;
    private int page;
    private int size;
    private String sortBy;
    private String sortDirection;
}