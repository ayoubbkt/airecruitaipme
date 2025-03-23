package com.recruitpme.notificationservice.controller;

import com.recruitpme.notificationservice.dto.EmailTemplateDTO;
import com.recruitpme.notificationservice.service.EmailTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/email-templates")
public class EmailTemplateController {

    @Autowired
    private EmailTemplateService emailTemplateService;

    @GetMapping
    public ResponseEntity<List<EmailTemplateDTO>> getAllTemplates() {
        List<EmailTemplateDTO> templates = emailTemplateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplateDTO> getTemplateById(@PathVariable String id) {
        EmailTemplateDTO template = emailTemplateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<EmailTemplateDTO>> getTemplatesByCategory(@PathVariable String category) {
        List<EmailTemplateDTO> templates = emailTemplateService.getTemplatesByCategory(category);
        return ResponseEntity.ok(templates);
    }

    @PostMapping
    public ResponseEntity<EmailTemplateDTO> createTemplate(@Valid @RequestBody EmailTemplateDTO templateDTO) {
        EmailTemplateDTO createdTemplate = emailTemplateService.createTemplate(templateDTO);
        return ResponseEntity.ok(createdTemplate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplateDTO> updateTemplate(
            @PathVariable String id,
            @Valid @RequestBody EmailTemplateDTO templateDTO) {

        EmailTemplateDTO updatedTemplate = emailTemplateService.updateTemplate(id, templateDTO);
        return ResponseEntity.ok(updatedTemplate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        emailTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/process")
    public ResponseEntity<String> processTemplate(
            @PathVariable String id,
            @RequestBody Map<String, Object> model) {

        String processedContent = emailTemplateService.processTemplate(id, model);
        return ResponseEntity.ok(processedContent);
    }
}