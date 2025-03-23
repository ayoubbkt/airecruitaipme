package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.MessageTemplateDTO;
import com.recruitpme.notificationservice.entity.MessageTemplate;
import com.recruitpme.notificationservice.exception.ResourceNotFoundException;
import com.recruitpme.notificationservice.repository.MessageTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageTemplateServiceImpl implements MessageTemplateService {

    @Autowired
    private MessageTemplateRepository messageTemplateRepository;

    @Override
    public List<MessageTemplateDTO> getAllTemplates() {
        return messageTemplateRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageTemplateDTO> getRequiredTemplates() {
        return messageTemplateRepository.findByIsRequired(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageTemplateDTO> getCustomTemplates() {
        return messageTemplateRepository.findByIsRequired(false).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MessageTemplateDTO getTemplateById(String id) {
        MessageTemplate template = messageTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message template not found with id: " + id));

        return convertToDTO(template);
    }

    @Override
    public List<MessageTemplateDTO> getTemplatesByCategory(String category) {
        return messageTemplateRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MessageTemplateDTO createTemplate(MessageTemplateDTO templateDTO) {
        MessageTemplate template = convertToEntity(templateDTO);
        template.setId(UUID.randomUUID().toString());

        MessageTemplate savedTemplate = messageTemplateRepository.save(template);
        return convertToDTO(savedTemplate);
    }

    @Override
    public MessageTemplateDTO updateTemplate(String id, MessageTemplateDTO templateDTO) {
        if (!messageTemplateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Message template not found with id: " + id);
        }

        MessageTemplate template = convertToEntity(templateDTO);
        template.setId(id);

        MessageTemplate updatedTemplate = messageTemplateRepository.save(template);
        return convertToDTO(updatedTemplate);
    }

    @Override
    public void deleteTemplate(String id) {
        if (!messageTemplateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Message template not found with id: " + id);
        }

        messageTemplateRepository.deleteById(id);
    }

    @Override
    public String processTemplate(String templateId, Map<String, Object> model) {
        MessageTemplate template = messageTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Message template not found with id: " + templateId));

        String content = template.getContent();

        // Simple template processing (replace variables like {{name}} with their values)
        for (Map.Entry<String, Object> entry : model.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            content = content.replace("{{" + key + "}}", value);
        }

        return content;
    }

    private MessageTemplateDTO convertToDTO(MessageTemplate template) {
        MessageTemplateDTO dto = new MessageTemplateDTO();
        dto.setId(template.getId());
        dto.setName(template.getName());
        dto.setSubject(template.getSubject());
        dto.setContent(template.getContent());
        dto.setDescription(template.getDescription());
        dto.setDefault(template.isDefault());
        dto.setRequired(template.isRequired());
        dto.setCategory(template.getCategory());

        return dto;
    }

    private MessageTemplate convertToEntity(MessageTemplateDTO dto) {
        MessageTemplate template = new MessageTemplate();
        template.setId(dto.getId());
        template.setName(dto.getName());
        template.setSubject(dto.getSubject());
        template.setContent(dto.getContent());
        template.setDescription(dto.getDescription());
        template.setDefault(dto.isDefault());
        template.setRequired(dto.isRequired());
        template.setCategory(dto.getCategory());

        return template;
    }
}