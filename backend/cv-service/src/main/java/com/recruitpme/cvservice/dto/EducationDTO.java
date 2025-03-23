package com.recruitpme.cvservice.dto;

import lombok.Data;

@Data
public class EducationDTO {
    private String degree;
    private String institution;
    private String location;
    private String field;
    private String startYear;
    private String endYear;
    private String period;
    private String description;
}