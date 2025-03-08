package com.recruitpme.authservice.service;

import com.recruitpme.authservice.dto.LoginResponse;
import com.recruitpme.authservice.dto.RegistrationRequest;
import com.recruitpme.authservice.dto.UserDTO;
import com.recruitpme.authservice.entity.PasswordResetToken;
import com.recruitpme.authservice.entity.Role;
import com.recruitpme.authservice.entity.User;
import com.recruitpme.authservice.exception.AuthenticationException;
import com.recruitpme.authservice.exception.ResourceNotFoundException;
import com.recruitpme.authservice.repository.PasswordResetTokenRepository;
import com.recruitpme.authservice.repository.RoleRepository;
import com.recruitpme.authservice.repository.UserRepository;
import com.recruitpme.authservice.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Override
    public LoginResponse login(String email, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
            
            String token = tokenProvider.generateToken(authentication);
            
            return new LoginResponse(token, convertToDTO(user));
        } catch (Exception e) {
            log.error("Login failed for user: {}, error: {}", email, e.getMessage());
            throw new AuthenticationException("Invalid email or password");
        }
    }

    @Override
    @Transactional
    public UserDTO register(RegistrationRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthenticationException("Email already in use: " + request.getEmail());
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCompanyName(request.getCompanyName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        
        // Assign default role (ROLE_USER)
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new ResourceNotFoundException("Default role not found"));
        user.setRoles(Set.of(userRole));
        
        User savedUser = userRepository.save(user);
        
        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
        
        return convertToDTO(savedUser);
    }

    @Override
    @Transactional
    public void initiatePasswordReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // Generate reset token
            String token = UUID.randomUUID().toString();
            
            // Save token
            PasswordResetToken passwordResetToken = new PasswordResetToken();
            passwordResetToken.setToken(token);
            passwordResetToken.setUser(user);
            passwordResetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
            
            tokenRepository.save(passwordResetToken);
            
            // Send email with reset link
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
        });
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new AuthenticationException("Invalid or expired password reset token"));
        
        // Check if token is expired
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new AuthenticationException("Password reset token has expired");
        }
        
        // Update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        
        userRepository.save(user);
        
        // Delete used token
        tokenRepository.delete(resetToken);
    }

    @Override
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        return convertToDTO(user);
    }

    @Override
    public void logout() {
        // JWT tokens are stateless, so no server-side logout is needed
        // Client-side token removal is handled by the frontend
        SecurityContextHolder.clearContext();
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setCompanyName(user.getCompanyName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRoles().iterator().next().getName());
        dto.setEnabled(user.isEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        
        return dto;
    }
}