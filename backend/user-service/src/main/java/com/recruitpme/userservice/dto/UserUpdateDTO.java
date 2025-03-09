package com.recruitpme.userservice.dto;

import lombok.Data;

import javax.validation.constraints.Email;


@Data
public class UserUpdateDTO {
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String firstName;
    
    private String lastName;
    
    private String companyName;
    
    private String phoneNumber;
    
    private String role;
    
    private Boolean enabled;
}