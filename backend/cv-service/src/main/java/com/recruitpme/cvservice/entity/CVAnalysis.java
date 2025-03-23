package com.recruitpme.cvservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Document(indexName = "cv_analyses")
public class CVAnalysis {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String cvId;

    @Field(type = FieldType.Keyword)
    private String jobId;

    @Field(type = FieldType.Integer)
    private int score;

    @Field(type = FieldType.Text)
    private String firstName;

    @Field(type = FieldType.Text)
    private String lastName;

    @Field(type = FieldType.Text)
    private String email;

    @Field(type = FieldType.Text)
    private String phone;

    @Field(type = FieldType.Text)
    private String title;

    @Field(type = FieldType.Text)
    private String location;

    @Field(type = FieldType.Integer)
    private int yearsOfExperience;

    @Field(type = FieldType.Text)
    private List<String> skills;

    @Field(type = FieldType.Nested)
    private List<Map<String, Object>> requiredSkillsAnalysis;

    @Field(type = FieldType.Nested)
    private List<Map<String, Object>> preferredSkillsAnalysis;

    @Field(type = FieldType.Integer)
    private int requiredSkillsMatch;

    @Field(type = FieldType.Integer)
    private int requiredSkillsTotal;

    @Field(type = FieldType.Integer)
    private int preferredSkillsMatch;

    @Field(type = FieldType.Integer)
    private int preferredSkillsTotal;

    @Field(type = FieldType.Text)
    private List<String> experienceInsights;

    @Field(type = FieldType.Text)
    private List<String> educationInsights;

    @Field(type = FieldType.Text)
    private List<String> strengths;

    @Field(type = FieldType.Text)
    private List<String> areasForImprovement;

    @Field(type = FieldType.Text)
    private String jobFitAnalysis;

    @Field(type = FieldType.Nested)
    private List<Map<String, Object>> categoryScores;

    @Field(type = FieldType.Nested)
    private List<Map<String, Object>> interviewQuestions;

    @Field(type = FieldType.Nested)
    private List<Map<String, Object>> experience;

    @Field(type = FieldType.Nested)
    private List<Map<String, Object>> education;

    @Field(type = FieldType.Date)
    private LocalDateTime createdAt;

    @Field(type = FieldType.Date)
    private LocalDateTime updatedAt;
}