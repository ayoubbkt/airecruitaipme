package com.recruitpme.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.File;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Override
    public void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        emailSender.send(message);
    }

    @Override
    public void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> templateModel) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);

            Context context = new Context();
            templateModel.forEach(context::setVariable);

            String htmlContent = templateEngine.process(templateName, context);
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send template email", e);
        }
    }

    @Override
    public void sendEmailWithAttachment(String to, String subject, String text, String attachmentPath) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text);

            FileSystemResource file = new FileSystemResource(new File(attachmentPath));
            helper.addAttachment(file.getFilename(), file);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email with attachment", e);
        }
    }
}