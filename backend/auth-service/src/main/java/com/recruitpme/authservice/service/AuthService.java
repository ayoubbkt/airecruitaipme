package com.recruitpme.authservice.service;

import com.recruitpme.authservice.dto.LoginResponse;
import com.recruitpme.authservice.dto.RegistrationRequest;
import com.recruitpme.authservice.dto.UserDTO;


public interface AuthService {
    
    LoginResponse login(String email, String password);
    
    UserDTO register(RegistrationRequest request);
    
    void initiatePasswordReset(String email);
    
    void resetPassword(String token, String newPassword);
    
    UserDTO getCurrentUser();
    
    void logout();
}