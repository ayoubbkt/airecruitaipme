package com.recruitpme.jobservice.dto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;
import java.util.List;

@Data
public class JobCreateDTO {
    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 255, message = "Le titre ne peut pas dépasser 255 caractères")
    private String title;
    
    @NotBlank(message = "La description est obligatoire")
    private String description;
    
    @NotEmpty(message = "Au moins une compétence requise est nécessaire")
    private List<String> requiredSkills;
    
    private List<String> preferredSkills;
    
    @NotBlank(message = "La localisation est obligatoire")
    private String location;
    
    @NotBlank(message = "Le type de contrat est obligatoire")
    private String jobType;
    
    @Min(value = 0, message = "L'expérience minimale ne peut pas être négative")
    private Integer minYearsExperience;
    
    private String salaryRange;
    
    private String department;
}