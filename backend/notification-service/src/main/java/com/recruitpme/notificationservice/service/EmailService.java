package com.recruitpme.notificationservice.service;

import java.util.Map;

public interface EmailService {
    void sendSimpleEmail(String to, String subject, String text);

    void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> templateModel);

    void sendEmailWithAttachment(String to, String subject, String text, String attachmentPath);
}