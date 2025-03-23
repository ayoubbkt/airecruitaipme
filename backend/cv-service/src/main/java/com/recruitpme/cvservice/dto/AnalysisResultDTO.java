package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AnalysisResultDTO {
    private String cvId;
    private int score;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String title;
    private String location;
    private int yearsOfExperience;
    private List<String> skills;
    private List<SkillAnalysisDTO> requiredSkillsAnalysis;
    private List<SkillAnalysisDTO> preferredSkillsAnalysis;
    private int requiredSkillsMatch;
    private int requiredSkillsTotal;
    private int preferredSkillsMatch;
    private int preferredSkillsTotal;
    private List<String> experienceInsights;
    private List<String> educationInsights;
    private List<String> strengths;
    private List<String> areasForImprovement;
    private String jobFitAnalysis;
    private List<Map<String, Object>> categoryScores;
    private List<InterviewQuestionDTO> interviewQuestions;
    private List<ExperienceDTO> experience;
    private List<EducationDTO> education;
}