package com.recruitpme.notificationservice.controller;

import com.recruitpme.notificationservice.dto.MessageTemplateDTO;
import com.recruitpme.notificationservice.service.MessageTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/message-templates")
public class MessageTemplateController {

    @Autowired
    private MessageTemplateService messageTemplateService;

    @GetMapping
    public ResponseEntity<Map<String, List<MessageTemplateDTO>>> getAllTemplates() {
        Map<String, List<MessageTemplateDTO>> response = new HashMap<>();
        response.put("required", messageTemplateService.getRequiredTemplates());
        response.put("custom", messageTemplateService.getCustomTemplates());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageTemplateDTO> getTemplateById(@PathVariable String id) {
        MessageTemplateDTO template = messageTemplateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<MessageTemplateDTO>> getTemplatesByCategory(@PathVariable String category) {
        List<MessageTemplateDTO> templates = messageTemplateService.getTemplatesByCategory(category);
        return ResponseEntity.ok(templates);
    }

    @PostMapping
    public ResponseEntity<MessageTemplateDTO> createTemplate(@Valid @RequestBody MessageTemplateDTO templateDTO) {
        MessageTemplateDTO createdTemplate = messageTemplateService.createTemplate(templateDTO);
        return ResponseEntity.ok(createdTemplate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageTemplateDTO> updateTemplate(
            @PathVariable String id,
            @Valid @RequestBody MessageTemplateDTO templateDTO) {

        MessageTemplateDTO updatedTemplate = messageTemplateService.updateTemplate(id, templateDTO);
        return ResponseEntity.ok(updatedTemplate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        messageTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/process")
    public ResponseEntity<String> processTemplate(
            @PathVariable String id,
            @RequestBody Map<String, Object> model) {

        String processedContent = messageTemplateService.processTemplate(id, model);
        return ResponseEntity.ok(processedContent);
    }
}