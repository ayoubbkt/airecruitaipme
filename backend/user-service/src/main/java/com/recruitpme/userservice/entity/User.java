package com.recruitpme.userservice.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String firstName;
    
    private String lastName;
    
    private String companyName;
    
    private String phoneNumber;
    
    private String role;
    
    private boolean enabled;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}