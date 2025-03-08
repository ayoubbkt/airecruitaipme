// recruitpme/backend/cv-service/src/main/java/com/recruitpme/cvservice/dto/CVSearchCriteriaDTO.java
package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class CVSearchCriteriaDTO {
    private String keyword;
    private List<String> skills;
    private Integer minYearsExperience;
    private Integer maxYearsExperience;
    private Integer minScore;
    private Long jobId;
    private String status; // ANALYZED, QUALIFIED, REJECTED, etc.
    private int page;
    private int size;
    private String sortBy;
    private String sortDirection;
}