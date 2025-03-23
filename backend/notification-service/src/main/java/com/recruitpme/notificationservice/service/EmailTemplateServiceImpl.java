package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.EmailTemplateDTO;
import com.recruitpme.notificationservice.entity.EmailTemplate;
import com.recruitpme.notificationservice.exception.ResourceNotFoundException;
import com.recruitpme.notificationservice.repository.EmailTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmailTemplateServiceImpl implements EmailTemplateService {

    @Autowired
    private EmailTemplateRepository emailTemplateRepository;

    @Autowired
    private TemplateEngine templateEngine;

    @Override
    public List<EmailTemplateDTO> getAllTemplates() {
        return emailTemplateRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EmailTemplateDTO getTemplateById(String id) {
        EmailTemplate template = emailTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + id));

        return convertToDTO(template);
    }

    @Override
    public List<EmailTemplateDTO> getTemplatesByCategory(String category) {
        return emailTemplateRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EmailTemplateDTO createTemplate(EmailTemplateDTO templateDTO) {
        EmailTemplate template = convertToEntity(templateDTO);
        template.setId(UUID.randomUUID().toString());

        EmailTemplate savedTemplate = emailTemplateRepository.save(template);
        return convertToDTO(savedTemplate);
    }

    @Override
    public EmailTemplateDTO updateTemplate(String id, EmailTemplateDTO templateDTO) {
        if (!emailTemplateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Email template not found with id: " + id);
        }

        EmailTemplate template = convertToEntity(templateDTO);
        template.setId(id);

        EmailTemplate updatedTemplate = emailTemplateRepository.save(template);
        return convertToDTO(updatedTemplate);
    }

    @Override
    public void deleteTemplate(String id) {
        if (!emailTemplateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Email template not found with id: " + id);
        }

        emailTemplateRepository.deleteById(id);
    }

    @Override
    public String processTemplate(String templateId, Object model) {
        EmailTemplate template = emailTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + templateId));

        Context context = new Context();
        if (model instanceof Map) {
            ((Map<String, Object>) model).forEach(context::setVariable);
        }

        return templateEngine.process(template.getContent(), context);
    }

    private EmailTemplateDTO convertToDTO(EmailTemplate template) {
        EmailTemplateDTO dto = new EmailTemplateDTO();
        dto.setId(template.getId());
        dto.setName(template.getName());
        dto.setSubject(template.getSubject());
        dto.setContent(template.getContent());
        dto.setDescription(template.getDescription());
        dto.setDefault(template.isDefault());
        dto.setCategory(template.getCategory());

        return dto;
    }

    private EmailTemplate convertToEntity(EmailTemplateDTO dto) {
        EmailTemplate template = new EmailTemplate();
        template.setId(dto.getId());
        template.setName(dto.getName());
        template.setSubject(dto.getSubject());
        template.setContent(dto.getContent());
        template.setDescription(dto.getDescription());
        template.setDefault(dto.isDefault());
        template.setCategory(dto.getCategory());

        return template;
    }
}