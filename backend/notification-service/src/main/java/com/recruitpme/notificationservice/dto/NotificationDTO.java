package com.recruitpme.notificationservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String userId;
    private String type;
    private String title;
    private String message;
    private String link;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}