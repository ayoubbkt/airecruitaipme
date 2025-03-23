package com.recruitpme.notificationservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "message_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageTemplate {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String description;

    private boolean isDefault;

    private boolean isRequired;

    private String category;
}