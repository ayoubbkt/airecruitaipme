package com.recruitpme.notificationservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    private String id;

    @Column(nullable = false)
    private String conversationId;

    @Column(nullable = false)
    private String senderId;

    private String senderName;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private boolean read;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}