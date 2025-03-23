package com.recruitpme.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateDTO {
    private String userId;
    private String title;
    private String message;
    private String type;
    private String relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
}