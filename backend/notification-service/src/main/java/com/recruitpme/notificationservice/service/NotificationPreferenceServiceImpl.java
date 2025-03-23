package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.NotificationPreferenceDTO;
import com.recruitpme.notificationservice.entity.NotificationPreference;
import com.recruitpme.notificationservice.exception.ResourceNotFoundException;
import com.recruitpme.notificationservice.repository.NotificationPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationPreferenceServiceImpl implements NotificationPreferenceService {

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    @Override
    public List<NotificationPreferenceDTO> getUserPreferences(String userId) {
        return preferenceRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationPreferenceDTO getPreferenceById(String id) {
        NotificationPreference preference = preferenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification preference not found with id: " + id));

        return convertToDTO(preference);
    }

    @Override
    public NotificationPreferenceDTO getUserPreferenceByType(String userId, String notificationType) {
        NotificationPreference preference = preferenceRepository.findByUserIdAndNotificationType(userId, notificationType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification preference not found for userId: " + userId + " and type: " + notificationType));

        return convertToDTO(preference);
    }

    @Override
    public NotificationPreferenceDTO createOrUpdatePreference(NotificationPreferenceDTO preferenceDTO) {
        // Check if preference exists for user and type
        Optional<NotificationPreference> existingPreference = preferenceRepository
                .findByUserIdAndNotificationType(preferenceDTO.getUserId(), preferenceDTO.getNotificationType());

        NotificationPreference preference;

        if (existingPreference.isPresent()) {
            preference = existingPreference.get();
            preference.setEmailEnabled(preferenceDTO.isEmailEnabled());
            preference.setPushEnabled(preferenceDTO.isPushEnabled());
            preference.setInAppEnabled(preferenceDTO.isInAppEnabled());
        } else {
            preference = convertToEntity(preferenceDTO);
            preference.setId(UUID.randomUUID().toString());
        }

        NotificationPreference savedPreference = preferenceRepository.save(preference);
        return convertToDTO(savedPreference);
    }

    @Override
    public void deletePreference(String id) {
        if (!preferenceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification preference not found with id: " + id);
        }

        preferenceRepository.deleteById(id);
    }

    private NotificationPreferenceDTO convertToDTO(NotificationPreference preference) {
        NotificationPreferenceDTO dto = new NotificationPreferenceDTO();
        dto.setId(preference.getId());
        dto.setUserId(preference.getUserId());
        dto.setNotificationType(preference.getNotificationType());
        dto.setEmailEnabled(preference.isEmailEnabled());
        dto.setPushEnabled(preference.isPushEnabled());
        dto.setInAppEnabled(preference.isInAppEnabled());

        return dto;
    }

    private NotificationPreference convertToEntity(NotificationPreferenceDTO dto) {
        NotificationPreference preference = new NotificationPreference();
        preference.setId(dto.getId());
        preference.setUserId(dto.getUserId());
        preference.setNotificationType(dto.getNotificationType());
        preference.setEmailEnabled(dto.isEmailEnabled());
        preference.setPushEnabled(dto.isPushEnabled());
        preference.setInAppEnabled(dto.isInAppEnabled());

        return preference;
    }
}