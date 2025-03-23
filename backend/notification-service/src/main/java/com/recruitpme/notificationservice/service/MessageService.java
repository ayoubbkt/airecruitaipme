package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.*;

import java.util.List;

public interface MessageService {
    List<ConversationDTO> getConversations(String filter);

    List<MessageDTO> getMessages(String conversationId);

    ConversationDTO createConversation(ConversationCreateDTO conversationDTO);

    MessageDTO sendMessage(String conversationId, MessageCreateDTO messageDTO);

    MessageDTO markMessageAsRead(String messageId);

    UnreadCountDTO getUnreadCount(String userId);
}