package com.recruitpme.notificationservice.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class EmailTemplateDTO {
    private Long id;
    
    @NotBlank(message = "Template code is required")
    private String code;
    
    @NotBlank(message = "Template name is required")
    private String name;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private String description;
}