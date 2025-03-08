package com.recruitpme.userservice.service;

import com.recruitpme.userservice.dto.UserPreferenceDTO;
import com.recruitpme.userservice.entity.User;
import com.recruitpme.userservice.entity.UserPreference;
import com.recruitpme.userservice.exception.ResourceNotFoundException;
import com.recruitpme.userservice.repository.UserPreferenceRepository;
import com.recruitpme.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserPreferenceServiceImpl implements UserPreferenceService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;

    @Override
    @Transactional(readOnly = true)
    public UserPreferenceDTO getUserPreferences(Long userId) {
        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Get preferences
        Optional<UserPreference> preferenceOpt = userPreferenceRepository.findByUserId(userId);
        
        // If no preferences exist, create default ones
        if (preferenceOpt.isEmpty()) {
            return createDefaultPreferences(user);
        }
        
        return convertToDTO(preferenceOpt.get());
    }

    @Override
    @Transactional
    public UserPreferenceDTO updateUserPreferences(Long userId, UserPreferenceDTO preferencesDto) {
        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Get or create preferences
        UserPreference preference = userPreferenceRepository.findByUserId(userId)
                .orElse(new UserPreference());
        
        preference.setUser(user);
        
        if (preferencesDto.getLanguage() != null) {
            preference.setLanguage(preferencesDto.getLanguage());
        }
        
        if (preferencesDto.getTimezone() != null) {
            preference.setTimezone(preferencesDto.getTimezone());
        }
        
        if (preferencesDto.getTheme() != null) {
            preference.setTheme(preferencesDto.getTheme());
        }
        
        if (preferencesDto.getDashboardLayout() != null) {
            preference.setDashboardLayout(preferencesDto.getDashboardLayout());
        }
        
        UserPreference savedPreference = userPreferenceRepository.save(preference);
        
        return convertToDTO(savedPreference);
    }

    @Override
    @Transactional
    public UserPreferenceDTO resetUserPreferences(Long userId) {
        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Delete existing preferences if they exist
        userPreferenceRepository.findByUserId(userId)
                .ifPresent(userPreferenceRepository::delete);
        
        // Create default preferences
        return createDefaultPreferences(user);
    }
    
    private UserPreferenceDTO createDefaultPreferences(User user) {
        UserPreference preference = new UserPreference();
        preference.setUser(user);
        preference.setLanguage("fr");
        preference.setTimezone("Europe/Paris");
        preference.setTheme("light");
        preference.setDashboardLayout("{\"layout\":\"default\"}");
        
        UserPreference savedPreference = userPreferenceRepository.save(preference);
        
        return convertToDTO(savedPreference);
    }
    
    private UserPreferenceDTO convertToDTO(UserPreference preference) {
        UserPreferenceDTO dto = new UserPreferenceDTO();
        dto.setId(preference.getId());
        dto.setUserId(preference.getUser().getId());
        dto.setLanguage(preference.getLanguage());
        dto.setTimezone(preference.getTimezone());
        dto.setTheme(preference.getTheme());
        dto.setDashboardLayout(preference.getDashboardLayout());
        
        return dto;
    }
}