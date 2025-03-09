package com.recruitpme.authservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
@Slf4j
public class EmailServiceImpl implements EmailService {
    
    private final JavaMailSender emailSender;
    private final boolean emailEnabled;
    
    @Value("${spring.mail.username:noreply@example.com}")
    private String fromEmail;
    
    @Value("${app.url:http://localhost:3000}")
    private String appUrl;
    
    @Autowired(required = false)
    public EmailServiceImpl(JavaMailSender emailSender) {
        this.emailSender = emailSender;
        this.emailEnabled = (emailSender != null);
    }
    
    @Override
    public void sendWelcomeEmail(String to, String firstName) {
        if (!emailEnabled) {
            log.info("Email service disabled. Would send welcome email to: {}", to);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Bienvenue sur RecrutPME");
            message.setText("Bonjour " + firstName + ",\n\n" +
                    "Nous vous souhaitons la bienvenue sur RecrutPME, votre plateforme d'analyse de CV par IA.\n\n" +
                    "Vous pouvez dès maintenant commencer à analyser des CV et trouver les meilleurs candidats pour vos postes.\n\n" +
                    "Cordialement,\n" +
                    "L'équipe RecrutPME");
            
            emailSender.send(message);
            log.info("Welcome email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}, error: {}", to, e.getMessage());
        }
    }
    
    @Override
    public void sendPasswordResetEmail(String to, String firstName, String token) {
        if (!emailEnabled) {
            log.info("Email service disabled. Would send password reset email to: {}", to);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Réinitialisation de votre mot de passe");
            message.setText("Bonjour " + firstName + ",\n\n" +
                    "Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe:\n\n" +
                    appUrl + "/reset-password?token=" + token + "\n\n" +
                    "Ce lien est valable pendant 24 heures.\n\n" +
                    "Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.\n\n" +
                    "Cordialement,\n" +
                    "L'équipe RecrutPME");
            
            emailSender.send(message);
            log.info("Password reset email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}, error: {}", to, e.getMessage());
        }
    }
}