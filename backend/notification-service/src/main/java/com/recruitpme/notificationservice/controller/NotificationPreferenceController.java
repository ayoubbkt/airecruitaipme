package com.recruitpme.notificationservice.controller;

import com.recruitpme.notificationservice.dto.NotificationPreferenceDTO;
import com.recruitpme.notificationservice.service.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/notification-preferences")
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    @GetMapping("/{userId}")
    public ResponseEntity<NotificationPreferenceDTO> getUserPreferences(@PathVariable String userId) {
        log.info("Fetching notification preferences for user: {}", userId);
        NotificationPreferenceDTO preferences = preferenceService.getUserPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<NotificationPreferenceDTO> updateUserPreferences(
            @PathVariable String userId,
            @Valid @RequestBody NotificationPreferenceDTO preferencesDto) {
        
        log.info("Updating notification preferences for user: {}", userId);
        NotificationPreferenceDTO updatedPreferences = preferenceService.updateUserPreferences(userId, preferencesDto);
        return ResponseEntity.ok(updatedPreferences);
    }

    @PostMapping("/{userId}/reset")
    public ResponseEntity<NotificationPreferenceDTO> resetUserPreferences(@PathVariable String userId) {
        log.info("Resetting notification preferences for user: {}", userId);
        NotificationPreferenceDTO defaultPreferences = preferenceService.resetUserPreferences(userId);
        return ResponseEntity.ok(defaultPreferences);
    }
}