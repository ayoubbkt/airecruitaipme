package com.recruitpme.notificationservice.service;


import com.recruitpme.notificationservice.dto.NotificationCountDTO;
import com.recruitpme.notificationservice.dto.NotificationCreateDTO;
import com.recruitpme.notificationservice.dto.NotificationDTO;
import com.recruitpme.notificationservice.entity.EmailTemplate;
import com.recruitpme.notificationservice.entity.Notification;
import com.recruitpme.notificationservice.entity.NotificationPreference;
import com.recruitpme.notificationservice.exception.ResourceNotFoundException;
import com.recruitpme.notificationservice.repository.EmailTemplateRepository;
import com.recruitpme.notificationservice.repository.NotificationPreferenceRepository;
import com.recruitpme.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final EmailTemplateRepository emailTemplateRepository;
    private final JavaMailSender emailSender;
    private final SpringTemplateEngine templateEngine;
    
    private final String fromEmail;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(String userId, Boolean read) {
        List<Notification> notifications;
        
        if (read != null) {
            notifications = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, read);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationDTO getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        
        return convertToDTO(notification);
    }

    @Override
    @Transactional
    public NotificationDTO createNotification(NotificationCreateDTO notificationDto) {
        // Check user notification preferences
        Optional<NotificationPreference> preferenceOpt = preferenceRepository.findByUserId(notificationDto.getUserId());
        
        // If user has disabled this type of notification, log and return null
        if (preferenceOpt.isPresent()) {
            NotificationPreference preference = preferenceOpt.get();
            
            if ("EMAIL".equals(notificationDto.getType()) && !preference.isEmailNotifications() ||
                "IN_APP".equals(notificationDto.getType()) && !preference.isInAppNotifications() ||
                "SMS".equals(notificationDto.getType()) && !preference.isSmsNotifications()) {
                
                log.info("User {} has disabled {} notifications", notificationDto.getUserId(), notificationDto.getType());
                return null;
            }
            
            // Check if category is disabled
            if (preference.getDisabledCategories() != null && !preference.getDisabledCategories().isEmpty()) {
                String[] disabledCategories = preference.getDisabledCategories().split(",");
                for (String category : disabledCategories) {
                    if (notificationDto.getTitle().toLowerCase().contains(category.toLowerCase())) {
                        log.info("User {} has disabled notifications for category {}", notificationDto.getUserId(), category);
                        return null;
                    }
                }
            }
        }
        
        Notification notification = new Notification();
        notification.setUserId(notificationDto.getUserId());
        notification.setType(notificationDto.getType());
        notification.setTitle(notificationDto.getTitle());
        notification.setMessage(notificationDto.getMessage());
        notification.setLink(notificationDto.getLink());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        Notification savedNotification = notificationRepository.save(notification);
        
        return convertToDTO(savedNotification);
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        
        notification.setRead(true);
        notification.setUpdatedAt(LocalDateTime.now());
        
        Notification updatedNotification = notificationRepository.save(notification);
        
        return convertToDTO(updatedNotification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false);
        
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notification.setUpdatedAt(LocalDateTime.now());
        });
        
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationCountDTO getNotificationCount(String userId) {
        long unreadCount = notificationRepository.countByUserIdAndRead(userId, false);
        long totalCount = notificationRepository.countByUserIdAndRead(userId, true) + unreadCount;
        
        NotificationCountDTO countDTO = new NotificationCountDTO();
        countDTO.setUserId(userId);
        countDTO.setUnreadCount(unreadCount);
        countDTO.setTotalCount(totalCount);
        
        return countDTO;
    }

    @Override
    public void sendEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            
            emailSender.send(message);
            
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}, error: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendTemplatedEmail(String to, String templateCode, Object data) {
        try {
            // Get email template
            EmailTemplate template = emailTemplateRepository.findByCode(templateCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Email template not found with code: " + templateCode));
            
            // Prepare message
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(template.getSubject());
            
            // Process template with Thymeleaf
            Context context = new Context();
            
            // If data is a map, add all entries to context
            if (data instanceof Map) {
                Map<String, Object> dataMap = (Map<String, Object>) data;
                dataMap.forEach(context::setVariable);
            } else {
                // If not a map, add data as a single variable
                context.setVariable("data", data);
            }
            
            String htmlContent = templateEngine.process(templateCode, context);
            helper.setText(htmlContent, true);
            
            emailSender.send(message);
            
            log.info("Templated email sent successfully to: {}, template: {}", to, templateCode);
        } catch (MessagingException e) {
            log.error("Failed to send templated email to: {}, template: {}, error: {}", to, templateCode, e.getMessage());
            throw new RuntimeException("Failed to send templated email", e);
        }
    }
    
    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setLink(notification.getLink());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setUpdatedAt(notification.getUpdatedAt());
        
        return dto;
    }
}