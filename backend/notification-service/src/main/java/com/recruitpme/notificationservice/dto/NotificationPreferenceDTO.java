package com.recruitpme.notificationservice.dto;

import lombok.Data;

import java.util.List;


@Data
public class NotificationPreferenceDTO {
    private Long id;
    private String userId;
    private boolean emailNotifications;
    private boolean inAppNotifications;
    private boolean smsNotifications;
    private List<String> disabledCategories;
}