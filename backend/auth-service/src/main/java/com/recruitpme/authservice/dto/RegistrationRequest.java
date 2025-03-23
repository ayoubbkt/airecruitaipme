package com.recruitpme.authservice.dto;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;



@Data
public class RegistrationRequest {
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String password;
    
    @NotBlank(message = "Le prénom est obligatoire")
    private String firstName;
    
    @NotBlank(message = "Le nom est obligatoire")
    private String lastName;
    
    private String companyName;
    
    @Pattern(regexp = "^[+]?[(]?[0-9]{1,4}[)]?[-\\s.]?[0-9]{1,12}$", message = "Format de téléphone invalide")
    private String phoneNumber;
}