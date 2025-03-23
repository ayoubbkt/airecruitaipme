package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.MessageTemplateDTO;

import java.util.List;
import java.util.Map;

public interface MessageTemplateService {
    List<MessageTemplateDTO> getAllTemplates();

    List<MessageTemplateDTO> getRequiredTemplates();

    List<MessageTemplateDTO> getCustomTemplates();

    MessageTemplateDTO getTemplateById(String id);

    List<MessageTemplateDTO> getTemplatesByCategory(String category);

    MessageTemplateDTO createTemplate(MessageTemplateDTO templateDTO);

    MessageTemplateDTO updateTemplate(String id, MessageTemplateDTO templateDTO);

    void deleteTemplate(String id);

    String processTemplate(String templateId, Map<String, Object> model);
}