package com.recruitpme.notificationservice.dto;

import lombok.Data;

@Data
public class NotificationCountDTO {
    private String userId;
    private long unreadCount;
    private long totalCount;
}