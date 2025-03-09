package com.recruitpme.interviewservice.dto;

import lombok.Data;


import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InterviewCreateDTO {
    @NotBlank(message = "L'ID du candidat est obligatoire")
    private String candidateId;
    
    private Long jobId;
    
    @NotBlank(message = "Le type d'entretien est obligatoire")
    private String interviewType; // VIDEO, PHONE, IN_PERSON
    
    @NotNull(message = "La date et l'heure sont obligatoires")
    private LocalDateTime scheduledTime;
    
    @NotNull(message = "La durée est obligatoire")
    @Min(value = 15, message = "La durée minimale est de 15 minutes")
    private Integer duration; // in minutes
    
    private String location;
    
    @NotEmpty(message = "Au moins un interviewer est obligatoire")
    private List<String> interviewers;
    
    private String notes;
}