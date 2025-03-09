package com.recruitpme.notificationservice.entity;

import lombok.Data;

import javax.persistence.*;


@Entity
@Table(name = "notification_preferences")
@Data
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String userId;
    
    private boolean emailNotifications;
    
    private boolean inAppNotifications;
    
    private boolean smsNotifications;
    
    @Column(columnDefinition = "TEXT")
    private String disabledCategories; // comma separated
}