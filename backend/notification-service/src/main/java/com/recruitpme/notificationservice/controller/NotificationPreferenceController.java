package com.recruitpme.notificationservice.controller;

import com.recruitpme.notificationservice.dto.NotificationPreferenceDTO;
import com.recruitpme.notificationservice.service.NotificationPreferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/notification-preferences")
public class NotificationPreferenceController {

    @Autowired
    private NotificationPreferenceService preferenceService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationPreferenceDTO>> getUserPreferences(@PathVariable String userId) {
        List<NotificationPreferenceDTO> preferences = preferenceService.getUserPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationPreferenceDTO> getPreferenceById(@PathVariable String id) {
        NotificationPreferenceDTO preference = preferenceService.getPreferenceById(id);
        return ResponseEntity.ok(preference);
    }

    @GetMapping("/user/{userId}/type/{notificationType}")
    public ResponseEntity<NotificationPreferenceDTO> getUserPreferenceByType(
            @PathVariable String userId,
            @PathVariable String notificationType) {

        NotificationPreferenceDTO preference = preferenceService.getUserPreferenceByType(userId, notificationType);
        return ResponseEntity.ok(preference);
    }

    @PostMapping
    public ResponseEntity<NotificationPreferenceDTO> createOrUpdatePreference(
            @Valid @RequestBody NotificationPreferenceDTO preferenceDTO) {

        NotificationPreferenceDTO savedPreference = preferenceService.createOrUpdatePreference(preferenceDTO);
        return ResponseEntity.ok(savedPreference);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePreference(@PathVariable String id) {
        preferenceService.deletePreference(id);
        return ResponseEntity.noContent().build();
    }
}