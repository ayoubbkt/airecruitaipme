package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class CVAnalysisResponseDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String title;
    private int score;
    private int yearsOfExperience;
    private List<String> skills;
    private int requiredSkillsMatch;
    private int requiredSkillsTotal;
    private int preferredSkillsMatch;
    private int preferredSkillsTotal;
}