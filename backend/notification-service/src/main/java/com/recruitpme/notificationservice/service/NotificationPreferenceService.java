package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.NotificationPreferenceDTO;


public interface NotificationPreferenceService {
    
    NotificationPreferenceDTO getUserPreferences(String userId);
    
    NotificationPreferenceDTO updateUserPreferences(String userId, NotificationPreferenceDTO preferencesDto);
    
    NotificationPreferenceDTO resetUserPreferences(String userId);
}