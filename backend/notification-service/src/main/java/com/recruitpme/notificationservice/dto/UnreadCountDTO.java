package com.recruitpme.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnreadCountDTO {
    private int unreadMessages;
    private int totalConversations;
}