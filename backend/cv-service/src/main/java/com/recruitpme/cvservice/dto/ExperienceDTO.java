package com.recruitpme.cvservice.dto;

import lombok.Data;

@Data
public class ExperienceDTO {
    private String title;
    private String company;
    private String location;
    private String startDate;
    private String endDate;
    private String period;
    private String description;
    private boolean currentPosition;
}