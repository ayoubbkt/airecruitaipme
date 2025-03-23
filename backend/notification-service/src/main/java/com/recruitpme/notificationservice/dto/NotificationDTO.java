package com.recruitpme.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private String id;
    private String userId;
    private String title;
    private String message;
    private String type;
    private String relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
    private boolean read;
    private LocalDateTime createdAt;
}