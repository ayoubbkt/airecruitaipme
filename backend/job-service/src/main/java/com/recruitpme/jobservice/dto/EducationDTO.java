package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EducationDTO {
    private String id;
    private String degree;
    private String institution;
    private String location;
    private String startYear;
    private String endYear;
    private String description;
}