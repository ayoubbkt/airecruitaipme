package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.NotificationPreferenceDTO;
import com.recruitpme.notificationservice.entity.NotificationPreference;
import com.recruitpme.notificationservice.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferenceServiceImpl implements NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    @Override
    @Transactional(readOnly = true)
    public NotificationPreferenceDTO getUserPreferences(String userId) {
        Optional<NotificationPreference> preferenceOpt = preferenceRepository.findByUserId(userId);
        
        // If user has no preferences yet, create default ones
        if (preferenceOpt.isEmpty()) {
            return createDefaultPreferences(userId);
        }
        
        return convertToDTO(preferenceOpt.get());
    }

    @Override
    @Transactional
    public NotificationPreferenceDTO updateUserPreferences(String userId, NotificationPreferenceDTO preferencesDto) {
        Optional<NotificationPreference> preferenceOpt = preferenceRepository.findByUserId(userId);
        
        NotificationPreference preference;
        
        if (preferenceOpt.isEmpty()) {
            // Create new preferences if none exist
            preference = new NotificationPreference();
            preference.setUserId(userId);
        } else {
            preference = preferenceOpt.get();
        }
        
        preference.setEmailNotifications(preferencesDto.isEmailNotifications());
        preference.setInAppNotifications(preferencesDto.isInAppNotifications());
        preference.setSmsNotifications(preferencesDto.isSmsNotifications());
        
        // Convert disabled categories list to comma-separated string
        if (preferencesDto.getDisabledCategories() != null && !preferencesDto.getDisabledCategories().isEmpty()) {
            preference.setDisabledCategories(String.join(",", preferencesDto.getDisabledCategories()));
        } else {
            preference.setDisabledCategories("");
        }
        
        NotificationPreference savedPreference = preferenceRepository.save(preference);
        
        return convertToDTO(savedPreference);
    }

    @Override
    @Transactional
    public NotificationPreferenceDTO resetUserPreferences(String userId) {
        Optional<NotificationPreference> preferenceOpt = preferenceRepository.findByUserId(userId);
        
        if (preferenceOpt.isPresent()) {
            preferenceRepository.delete(preferenceOpt.get());
        }
        
        return createDefaultPreferences(userId);
    }
    
    private NotificationPreferenceDTO createDefaultPreferences(String userId) {
        NotificationPreference preference = new NotificationPreference();
        preference.setUserId(userId);
        preference.setEmailNotifications(true);
        preference.setInAppNotifications(true);
        preference.setSmsNotifications(false);
        preference.setDisabledCategories("");
        
        NotificationPreference savedPreference = preferenceRepository.save(preference);
        
        return convertToDTO(savedPreference);
    }
    
    private NotificationPreferenceDTO convertToDTO(NotificationPreference preference) {
        NotificationPreferenceDTO dto = new NotificationPreferenceDTO();
        dto.setId(preference.getId());
        dto.setUserId(preference.getUserId());
        dto.setEmailNotifications(preference.isEmailNotifications());
        dto.setInAppNotifications(preference.isInAppNotifications());
        dto.setSmsNotifications(preference.isSmsNotifications());
        
        // Convert comma-separated string to list
        if (preference.getDisabledCategories() != null && !preference.getDisabledCategories().isEmpty()) {
            dto.setDisabledCategories(Arrays.asList(preference.getDisabledCategories().split(",")));
        }
        
        return dto;
    }
}