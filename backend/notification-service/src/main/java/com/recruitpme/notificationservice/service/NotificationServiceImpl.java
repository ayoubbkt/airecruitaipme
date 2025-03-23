package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.NotificationCountDTO;
import com.recruitpme.notificationservice.dto.NotificationCreateDTO;
import com.recruitpme.notificationservice.dto.NotificationDTO;
import com.recruitpme.notificationservice.entity.Notification;
import com.recruitpme.notificationservice.exception.ResourceNotFoundException;
import com.recruitpme.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public List<NotificationDTO> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<NotificationDTO> getUserNotificationsPaged(String userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::convertToDTO);
    }

    @Override
    public List<NotificationDTO> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationDTO getNotificationById(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        return convertToDTO(notification);
    }

    @Override
    public NotificationDTO createNotification(NotificationCreateDTO notificationDTO) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID().toString());
        notification.setUserId(notificationDTO.getUserId());
        notification.setTitle(notificationDTO.getTitle());
        notification.setMessage(notificationDTO.getMessage());
        notification.setType(notificationDTO.getType());
        notification.setRelatedEntityId(notificationDTO.getRelatedEntityId());
        notification.setRelatedEntityType(notificationDTO.getRelatedEntityType());
        notification.setActionUrl(notificationDTO.getActionUrl());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification savedNotification = notificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    @Override
    public NotificationDTO markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);

        return convertToDTO(updatedNotification);
    }

    @Override
    public List<NotificationDTO> markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false);

        unreadNotifications.forEach(notification -> notification.setRead(true));
        List<Notification> updatedNotifications = notificationRepository.saveAll(unreadNotifications);

        return updatedNotifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteNotification(String id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }

        notificationRepository.deleteById(id);
    }

    @Override
    public NotificationCountDTO getNotificationCount(String userId) {
        Long totalCount = (long) notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).size();
        Long unreadCount = notificationRepository.countUnreadByUserId(userId);

        return new NotificationCountDTO(totalCount, unreadCount);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setRelatedEntityId(notification.getRelatedEntityId());
        dto.setRelatedEntityType(notification.getRelatedEntityType());
        dto.setActionUrl(notification.getActionUrl());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());

        return dto;
    }
}