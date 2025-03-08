package com.recruitpme.notificationservice.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class NotificationCreateDTO {
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Notification type is required")
    private String type;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    private String link;
}