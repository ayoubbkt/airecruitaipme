package com.recruitpme.notificationservice.controller;

import com.recruitpme.notificationservice.dto.NotificationCountDTO;
import com.recruitpme.notificationservice.dto.NotificationCreateDTO;
import com.recruitpme.notificationservice.dto.NotificationDTO;
import com.recruitpme.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(
            @PathVariable String userId,
            @RequestParam(value = "read", required = false) Boolean read) {
        
        log.info("Fetching notifications for user: {}, read status: {}", userId, read);
        List<NotificationDTO> notifications = notificationService.getUserNotifications(userId, read);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/count/{userId}")
    public ResponseEntity<NotificationCountDTO> getNotificationCount(@PathVariable String userId) {
        log.info("Fetching notification count for user: {}", userId);
        NotificationCountDTO count = notificationService.getNotificationCount(userId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getNotificationById(@PathVariable Long id) {
        log.info("Fetching notification with ID: {}", id);
        NotificationDTO notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(notification);
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@Valid @RequestBody NotificationCreateDTO notificationDto) {
        log.info("Creating notification for user: {}", notificationDto.getUserId());
        NotificationDTO createdNotification = notificationService.createNotification(notificationDto);
        
        if (createdNotification == null) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(createdNotification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        log.info("Marking notification as read: {}", id);
        NotificationDTO updatedNotification = notificationService.markAsRead(id);
        return ResponseEntity.ok(updatedNotification);
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email")
    public ResponseEntity<Void> sendEmail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String content) {
        
        log.info("Sending email to: {}, subject: {}", to, subject);
        notificationService.sendEmail(to, subject, content);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email/template")
    public ResponseEntity<Void> sendTemplatedEmail(
            @RequestParam String to,
            @RequestParam String templateCode,
            @RequestBody Map<String, Object> data) {
        
        log.info("Sending templated email to: {}, template: {}", to, templateCode);
        notificationService.sendTemplatedEmail(to, templateCode, data);
        return ResponseEntity.ok().build();
    }
}