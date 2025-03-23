package com.recruitpme.interviewservice.dto;

import lombok.Data;
import java.util.List;



@Data
public class InterviewQuestionsRequestDTO {
    private List<String> skills;
    private List<Object> experiences;
    private String jobDescription;
}