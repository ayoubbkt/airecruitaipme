package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceDTO {
    private String id;
    private String title;
    private String company;
    private String location;
    private String startDate;
    private String endDate;
    private String description;
}