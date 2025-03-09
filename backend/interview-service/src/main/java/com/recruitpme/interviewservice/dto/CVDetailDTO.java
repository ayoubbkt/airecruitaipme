package com.recruitpme.interviewservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;


@Data
public class CVDetailDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String title;
    private int yearsOfExperience;
    private List<String> skills;
    private List<ExperienceDTO> experience;
    private List<EducationDTO> education;
    private int score;
    private String status;
}