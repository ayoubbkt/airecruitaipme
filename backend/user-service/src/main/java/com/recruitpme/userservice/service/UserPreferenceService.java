package com.recruitpme.userservice.service;

import com.recruitpme.userservice.dto.UserPreferenceDTO;


public interface UserPreferenceService {
    
    UserPreferenceDTO getUserPreferences(Long userId);
    
    UserPreferenceDTO updateUserPreferences(Long userId, UserPreferenceDTO preferencesDto);
    
    UserPreferenceDTO resetUserPreferences(Long userId);
}