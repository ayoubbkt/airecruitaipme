package com.recruitpme.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailTemplateDTO {
    private String id;
    private String name;
    private String subject;
    private String content;
    private String description;
    private boolean isDefault;
    private String category;
}