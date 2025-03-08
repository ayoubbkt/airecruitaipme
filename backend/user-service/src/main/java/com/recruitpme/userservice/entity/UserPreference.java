package com.recruitpme.userservice.entity;

import lombok.Data;

import javax.persistence.*;

@Entity
@Table(name = "user_preferences")
@Data
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String language;
    
    private String timezone;
    
    private String theme; // light, dark
    
    @Column(columnDefinition = "TEXT")
    private String dashboardLayout; // JSON format
}