package com.recruitpme.authservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@Profile("dev") // Utilisez ce service uniquement pour le profil "dev"
public class DummyEmailServiceImpl implements EmailService {

    @Override
    public void sendWelcomeEmail(String to, String firstName) {
        log.info("DUMMY EMAIL SERVICE - Welcome email would be sent to: {}", to);
    }

    @Override
    public void sendPasswordResetEmail(String to, String firstName, String token) {
        log.info("DUMMY EMAIL SERVICE - Password reset email would be sent to: {}", to);
        log.info("Reset token: {}", token);
    }
}