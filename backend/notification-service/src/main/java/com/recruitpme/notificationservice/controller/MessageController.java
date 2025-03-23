package com.recruitpme.notificationservice.controller;

import com.recruitpme.notificationservice.dto.*;
import com.recruitpme.notificationservice.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(
            @RequestParam(required = false) String filter) {
        List<ConversationDTO> conversations = messageService.getConversations(filter);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getMessages(@PathVariable String conversationId) {
        List<MessageDTO> messages = messageService.getMessages(conversationId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationDTO> createConversation(
            @Valid @RequestBody ConversationCreateDTO conversationDTO) {
        ConversationDTO createdConversation = messageService.createConversation(conversationDTO);
        return ResponseEntity.ok(createdConversation);
    }

    @PostMapping("/conversations/{conversationId}")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable String conversationId,
            @Valid @RequestBody MessageCreateDTO messageDTO) {
        MessageDTO sentMessage = messageService.sendMessage(conversationId, messageDTO);
        return ResponseEntity.ok(sentMessage);
    }

    @PutMapping("/messages/{messageId}/read")
    public ResponseEntity<MessageDTO> markAsRead(@PathVariable String messageId) {
        MessageDTO message = messageService.markMessageAsRead(messageId);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<UnreadCountDTO> getUnreadCount(@PathVariable String userId) {
        UnreadCountDTO count = messageService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }
}