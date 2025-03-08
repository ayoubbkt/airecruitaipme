package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.NotificationCountDTO;
import com.recruitpme.notificationservice.dto.NotificationCreateDTO;
import com.recruitpme.notificationservice.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {
    
    List<NotificationDTO> getUserNotifications(String userId, Boolean read);
    
    NotificationDTO getNotificationById(Long id);
    
    NotificationDTO createNotification(NotificationCreateDTO notificationDto);
    
    NotificationDTO markAsRead(Long id);
    
    void markAllAsRead(String userId);
    
    NotificationCountDTO getNotificationCount(String userId);
    
    void sendEmail(String to, String subject, String content);
    
    void sendTemplatedEmail(String to, String templateCode, Object data);
}