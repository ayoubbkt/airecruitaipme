package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.NotificationPreferenceDTO;

import java.util.List;

public interface NotificationPreferenceService {
    List<NotificationPreferenceDTO> getUserPreferences(String userId);

    NotificationPreferenceDTO getPreferenceById(String id);

    NotificationPreferenceDTO getUserPreferenceByType(String userId, String notificationType);

    NotificationPreferenceDTO createOrUpdatePreference(NotificationPreferenceDTO preferenceDTO);

    void deletePreference(String id);
}