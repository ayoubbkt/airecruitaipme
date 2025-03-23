package com.recruitpme.authservice.controller;

import com.recruitpme.authservice.dto.LoginRequest;
import com.recruitpme.authservice.dto.LoginResponse;
import com.recruitpme.authservice.dto.RegistrationRequest;
import com.recruitpme.authservice.dto.UserDTO;
import com.recruitpme.authservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {


    private final AuthService authService;

    @GetMapping("/validate-token")
    public ResponseEntity<Boolean> validateToken(@RequestParam String token) {
        log.info("Validating token: {}", token);
        boolean isValid = authService.validateToken(token);
        log.info("Token validation result: {}", isValid);
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for user: {}", request.getEmail());
        LoginResponse response = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody RegistrationRequest request) {
        log.info("Registration attempt for user: {}", request.getEmail());
        UserDTO user = authService.register(request);
        return ResponseEntity.ok(user);
    }

//    @ExceptionHandler(Exception.class)
//    public ResponseEntity<Map<String, String>> handleException(Exception ex) {
//        log.error("Error in AuthController: {}", ex.getMessage());
//        Map<String, String> error = new HashMap<>();
//        error.put("error", ex.getMessage());
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
//    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        log.info("Password reset request for email: {}", email);
        authService.initiatePasswordReset(email);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset email sent if account exists");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String password = request.get("password");
        log.info("Password reset attempt with token");
        authService.resetPassword(token, password);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        UserDTO user = authService.getCurrentUser();
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        authService.logout();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }
}