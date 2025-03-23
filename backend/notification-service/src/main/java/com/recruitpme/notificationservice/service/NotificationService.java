package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.NotificationCountDTO;
import com.recruitpme.notificationservice.dto.NotificationCreateDTO;
import com.recruitpme.notificationservice.dto.NotificationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    List<NotificationDTO> getUserNotifications(String userId);

    Page<NotificationDTO> getUserNotificationsPaged(String userId, Pageable pageable);

    List<NotificationDTO> getUnreadNotifications(String userId);

    NotificationDTO getNotificationById(String id);

    NotificationDTO createNotification(NotificationCreateDTO notificationDTO);

    NotificationDTO markAsRead(String id);

    List<NotificationDTO> markAllAsRead(String userId);

    void deleteNotification(String id);

    NotificationCountDTO getNotificationCount(String userId);
}