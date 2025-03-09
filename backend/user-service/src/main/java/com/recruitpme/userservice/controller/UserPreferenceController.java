package com.recruitpme.userservice.controller;

import com.recruitpme.userservice.dto.UserPreferenceDTO;
import com.recruitpme.userservice.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import javax.validation.Valid;

@RestController
@RequestMapping("/api/users/{userId}/preferences")
@RequiredArgsConstructor
@Slf4j
public class UserPreferenceController {

    private final UserPreferenceService userPreferenceService;

    @GetMapping
    public ResponseEntity<UserPreferenceDTO> getUserPreferences(@PathVariable Long userId) {
        log.info("Fetching preferences for user with ID: {}", userId);
        UserPreferenceDTO preferences = userPreferenceService.getUserPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping
    public ResponseEntity<UserPreferenceDTO> updateUserPreferences(
            @PathVariable Long userId,
            @Valid @RequestBody UserPreferenceDTO preferencesDto) {
        
        log.info("Updating preferences for user with ID: {}", userId);
        UserPreferenceDTO updatedPreferences = userPreferenceService.updateUserPreferences(userId, preferencesDto);
        return ResponseEntity.ok(updatedPreferences);
    }

    @PostMapping("/reset")
    public ResponseEntity<UserPreferenceDTO> resetUserPreferences(@PathVariable Long userId) {
        log.info("Resetting preferences for user with ID: {}", userId);
        UserPreferenceDTO defaultPreferences = userPreferenceService.resetUserPreferences(userId);
        return ResponseEntity.ok(defaultPreferences);
    }
}