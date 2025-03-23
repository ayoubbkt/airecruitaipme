package com.recruitpme.notificationservice.controller;

import com.recruitpme.notificationservice.dto.NotificationCountDTO;
import com.recruitpme.notificationservice.dto.NotificationCreateDTO;
import com.recruitpme.notificationservice.dto.NotificationDTO;
import com.recruitpme.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable String userId) {
        List<NotificationDTO> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/paged")
    public ResponseEntity<Page<NotificationDTO>> getUserNotificationsPaged(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDTO> notifications = notificationService.getUserNotificationsPaged(userId, pageable);

        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable String userId) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getNotificationById(@PathVariable String id) {
        NotificationDTO notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(notification);
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@Valid @RequestBody NotificationCreateDTO notificationDTO) {
        NotificationDTO createdNotification = notificationService.createNotification(notificationDTO);
        return ResponseEntity.ok(createdNotification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable String id) {
        NotificationDTO notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<List<NotificationDTO>> markAllAsRead(@PathVariable String userId) {
        List<NotificationDTO> notifications = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(notifications);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<NotificationCountDTO> getNotificationCount(@PathVariable String userId) {
        NotificationCountDTO countDTO = notificationService.getNotificationCount(userId);
        return ResponseEntity.ok(countDTO);
    }
}