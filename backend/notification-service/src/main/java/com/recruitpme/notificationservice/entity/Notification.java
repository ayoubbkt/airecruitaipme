package com.recruitpme.notificationservice.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String userId;
    
    private String type; // EMAIL, IN_APP, SMS
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String link;
    
    private boolean read;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}