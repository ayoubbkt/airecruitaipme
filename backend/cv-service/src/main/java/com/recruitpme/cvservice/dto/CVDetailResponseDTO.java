package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class CVDetailResponseDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String title;
    private String location;
    private int score;
    private int yearsOfExperience;
    private List<String> skills;
    private List<ExperienceDTO> experience;
    private List<EducationDTO> education;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Analysis details
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

    // Notes
    private List<CandidateNoteDTO> notes;
}