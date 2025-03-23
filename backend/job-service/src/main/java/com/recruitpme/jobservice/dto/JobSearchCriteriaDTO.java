package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSearchCriteriaDTO {
    private String keyword;
    private String location;
    private List<String> jobTypes;
    private List<String> workTypes;
    private List<String> departments;
    private List<String> statuses;
    private Integer minYearsExperience;
    private Integer maxYearsExperience;
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDirection;
}