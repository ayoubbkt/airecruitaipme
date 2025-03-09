package com.recruitpme.authservice.service;

public interface EmailService {
    
    void sendWelcomeEmail(String to, String firstName);
    
    void sendPasswordResetEmail(String to, String firstName, String token);
}