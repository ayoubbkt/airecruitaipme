package com.recruitpme.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private String id;
    private CandidateInfoDTO candidate;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private int unreadCount;
    private String conversationType;
    private String relatedEntityId;
}