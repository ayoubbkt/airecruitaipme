package com.recruitpme.cvservice.dto;

import lombok.Data;

@Data
public class InterviewQuestionRequestDTO {
    private String candidateId;
    private String jobId;
    private int numberOfQuestions;
}