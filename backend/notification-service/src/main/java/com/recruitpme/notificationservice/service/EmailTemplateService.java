package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.EmailTemplateDTO;

import java.util.List;

public interface EmailTemplateService {
    
    List<EmailTemplateDTO> getAllTemplates();
    
    EmailTemplateDTO getTemplateById(Long id);
    
    EmailTemplateDTO getTemplateByCode(String code);
    
    EmailTemplateDTO createTemplate(EmailTemplateDTO templateDto);
    
    EmailTemplateDTO updateTemplate(Long id, EmailTemplateDTO templateDto);
    
    void deleteTemplate(Long id);
}