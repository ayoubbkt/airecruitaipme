package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.EmailTemplateDTO;
import com.recruitpme.notificationservice.entity.EmailTemplate;
import com.recruitpme.notificationservice.exception.ResourceNotFoundException;
import com.recruitpme.notificationservice.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailTemplateServiceImpl implements EmailTemplateService {

    private final EmailTemplateRepository emailTemplateRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EmailTemplateDTO> getAllTemplates() {
        List<EmailTemplate> templates = emailTemplateRepository.findAll();
        
        return templates.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmailTemplateDTO getTemplateById(Long id) {
        EmailTemplate template = emailTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + id));
        
        return convertToDTO(template);
    }

    @Override
    @Transactional(readOnly = true)
    public EmailTemplateDTO getTemplateByCode(String code) {
        EmailTemplate template = emailTemplateRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with code: " + code));
        
        return convertToDTO(template);
    }

    @Override
    @Transactional
    public EmailTemplateDTO createTemplate(EmailTemplateDTO templateDto) {
        // Check if template with same code already exists
        if (emailTemplateRepository.findByCode(templateDto.getCode()).isPresent()) {
            throw new IllegalStateException("Email template with code " + templateDto.getCode() + " already exists");
        }
        
        EmailTemplate template = new EmailTemplate();
        template.setCode(templateDto.getCode());
        template.setName(templateDto.getName());
        template.setSubject(templateDto.getSubject());
        template.setContent(templateDto.getContent());
        template.setDescription(templateDto.getDescription());
        
        EmailTemplate savedTemplate = emailTemplateRepository.save(template);
        
        return convertToDTO(savedTemplate);
    }

    @Override
    @Transactional
    public EmailTemplateDTO updateTemplate(Long id, EmailTemplateDTO templateDto) {
        EmailTemplate template = emailTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + id));
        
        // Check if code is being changed and if new code already exists
        if (!template.getCode().equals(templateDto.getCode()) && 
            emailTemplateRepository.findByCode(templateDto.getCode()).isPresent()) {
            throw new IllegalStateException("Email template with code " + templateDto.getCode() + " already exists");
        }
        
        template.setCode(templateDto.getCode());
        template.setName(templateDto.getName());
        template.setSubject(templateDto.getSubject());
        template.setContent(templateDto.getContent());
        template.setDescription(templateDto.getDescription());
        
        EmailTemplate updatedTemplate = emailTemplateRepository.save(template);
        
        return convertToDTO(updatedTemplate);
    }

    @Override
    @Transactional
    public void deleteTemplate(Long id) {
        if (!emailTemplateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Email template not found with id: " + id);
        }
        
        emailTemplateRepository.deleteById(id);
    }
    
    private EmailTemplateDTO convertToDTO(EmailTemplate template) {
        EmailTemplateDTO dto = new EmailTemplateDTO();
        dto.setId(template.getId());
        dto.setCode(template.getCode());
        dto.setName(template.getName());
        dto.setSubject(template.getSubject());
        dto.setContent(template.getContent());
        dto.setDescription(template.getDescription());
        
        return dto;
    }
}