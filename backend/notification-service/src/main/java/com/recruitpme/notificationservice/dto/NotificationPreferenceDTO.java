package com.recruitpme.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceDTO {
    private String id;
    private String userId;
    private String notificationType;
    private boolean emailEnabled;
    private boolean pushEnabled;
    private boolean inAppEnabled;
}