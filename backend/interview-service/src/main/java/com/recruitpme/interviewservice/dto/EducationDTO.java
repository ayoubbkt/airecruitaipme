package com.recruitpme.interviewservice.dto;

import lombok.Data;

@Data
public class EducationDTO {
    private String degree;
    private String institution;
    private String location;
    private String startYear;
    private String endYear;
}