package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.EmailTemplateDTO;

import java.util.List;

public interface EmailTemplateService {
    List<EmailTemplateDTO> getAllTemplates();

    EmailTemplateDTO getTemplateById(String id);

    List<EmailTemplateDTO> getTemplatesByCategory(String category);

    EmailTemplateDTO createTemplate(EmailTemplateDTO templateDTO);

    EmailTemplateDTO updateTemplate(String id, EmailTemplateDTO templateDTO);

    void deleteTemplate(String id);

    String processTemplate(String templateId, Object model);
}