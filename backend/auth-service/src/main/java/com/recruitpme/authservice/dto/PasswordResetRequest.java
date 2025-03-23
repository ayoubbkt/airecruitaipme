// PasswordResetRequest.java
package com.recruitpme.authservice.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;


@Data
public class PasswordResetRequest {
    @NotBlank(message = "Le token est obligatoire")
    private String token;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;
}
