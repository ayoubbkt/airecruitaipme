package com.recruitpme.notificationservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    @Id
    private String id;

    @Column(nullable = false)
    private String candidateId;

    private String candidateName;

    private String candidatePosition;

    private String candidateEmail;

    private String lastMessageId;

    private LocalDateTime lastMessageTime;

    private String conversationType;

    private String relatedEntityId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}