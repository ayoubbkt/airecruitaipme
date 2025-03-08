// recruitpme/backend/interview-service/src/main/java/com/recruitpme/interviewservice/dto/InterviewFeedbackDTO.java
package com.recruitpme.interviewservice.dto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

@Data
public class InterviewFeedbackDTO {
    @NotBlank(message = "L'interviewer est obligatoire")
    private String interviewer;
    
    @NotNull(message = "Le score technique est obligatoire")
    @Min(value = 1, message = "Le score minimum est 1")
    @Max(value = 5, message = "Le score maximum est 5")
    private Integer technicalScore;
    
    @NotNull(message = "Le score comportemental est obligatoire")
    @Min(value = 1, message = "Le score minimum est 1")
    @Max(value = 5, message = "Le score maximum est 5")
    private Integer behavioralScore;
    
    @NotNull(message = "La recommandation est obligatoire")
    private String recommendation; // HIRE, CONSIDER, REJECT
    
    @NotBlank(message = "Les commentaires sont obligatoires")
    private String comments;
    
    private List<Map<String, String>> skillFeedback; // Skill name and feedback
}