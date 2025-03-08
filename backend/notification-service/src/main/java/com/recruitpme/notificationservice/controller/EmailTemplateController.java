package com.recruitpme.notificationservice.controller;

import com.recruitpme.notificationservice.dto.EmailTemplateDTO;
import com.recruitpme.notificationservice.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/email-templates")
@RequiredArgsConstructor
@Slf4j
public class EmailTemplateController {

    private final EmailTemplateService emailTemplateService;

    @GetMapping
    public ResponseEntity<List<EmailTemplateDTO>> getAllTemplates() {
        log.info("Fetching all email templates");
        List<EmailTemplateDTO> templates = emailTemplateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplateDTO> getTemplateById(@PathVariable Long id) {
        log.info("Fetching email template with ID: {}", id);
        EmailTemplateDTO template = emailTemplateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<EmailTemplateDTO> getTemplateByCode(@PathVariable String code) {
        log.info("Fetching email template with code: {}", code);
        EmailTemplateDTO template = emailTemplateService.getTemplateByCode(code);
        return ResponseEntity.ok(template);
    }

    @PostMapping
    public ResponseEntity<EmailTemplateDTO> createTemplate(@Valid @RequestBody EmailTemplateDTO templateDto) {
        log.info("Creating email template with code: {}", templateDto.getCode());
        EmailTemplateDTO createdTemplate = emailTemplateService.createTemplate(templateDto);
        return ResponseEntity.ok(createdTemplate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplateDTO> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody EmailTemplateDTO templateDto) {
        
        log.info("Updating email template with ID: {}", id);
        EmailTemplateDTO updatedTemplate = emailTemplateService.updateTemplate(id, templateDto);
        return ResponseEntity.ok(updatedTemplate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        log.info("Deleting email template with ID: {}", id);
        emailTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}