package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CVDetailDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String title;
    private String location;
    private String summary;
    private Integer yearsOfExperience;
    private Double score;
    private List<String> skills = new ArrayList<>();
    private List<ExperienceDTO> experience = new ArrayList<>();
    private List<EducationDTO> education = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}