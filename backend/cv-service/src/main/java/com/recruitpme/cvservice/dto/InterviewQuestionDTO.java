package com.recruitpme.cvservice.dto;

import lombok.Data;

@Data
public class InterviewQuestionDTO {
    private String question;
    private String rationale;
    private String category;
}