package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.dto.ConversationDTO;
import com.recruitpme.notificationservice.dto.MessageCreateDTO;
import com.recruitpme.notificationservice.dto.MessageDTO;
import com.recruitpme.notificationservice.entity.Conversation;
import com.recruitpme.notificationservice.entity.Message;
import com.recruitpme.notificationservice.entity.Participant;
import com.recruitpme.notificationservice.exception.ResourceNotFoundException;
import com.recruitpme.notificationservice.repository.ConversationRepository;
import com.recruitpme.notificationservice.repository.MessageRepository;
import com.recruitpme.notificationservice.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Override
    public List<ConversationDTO> getConversations(String filter, String userId) {
        List<Conversation> conversations;

        if ("your-conversations".equals(filter) && userId != null) {
            // Get conversations where the user is a participant
            List<String> conversationIds = participantRepository.findByUserId(userId)
                    .stream()
                    .map(Participant::getConversationId)
                    .collect(Collectors.toList());

            conversations = conversationRepository.findAllById(conversationIds);
        } else if ("all-conversations".equals(filter)) {
            // Get all conversations
            conversations = conversationRepository.findAll();
        } else {
            // Default to user's conversations if no specific filter
            List<String> conversationIds = participantRepository.findByUserId(userId)
                    .stream()
                    .map(Participant::getConversationId)
                    .collect(Collectors.toList());

            conversations = conversationRepository.findAllById(conversationIds);
        }

        return conversations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> getMessagesInConversation(String conversationId) {
        if (!conversationRepository.existsById(conversationId)) {
            throw new ResourceNotFoundException("Conversation not found with id: " + conversationId);
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        return messages.stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageDTO sendMessage(String conversationId, MessageCreateDTO messageDTO) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        // Create and save message
        Message message = new Message();
        message.setId(UUID.randomUUID().toString());
        message.setConversationId(conversationId);
        message.setSenderId(messageDTO.getSenderId());
        message.setContent(messageDTO.getContent());
        message.setContentType(messageDTO.getContentType());
        message.setCreatedAt(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        // Update conversation with last message
        conversation.setLastMessageId(savedMessage.getId());
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Mark as unread for all participants except sender
        List<Participant> participants = participantRepository.findByConversationId(conversationId);
        for (Participant participant : participants) {
            if (!participant.getUserId().equals(messageDTO.getSenderId())) {
                participant.setLastReadMessageId(null);  // Mark as having unread messages
                participantRepository.save(participant);
            }
        }

        return convertToMessageDTO(savedMessage);
    }

    @Override
    @Transactional
    public ConversationDTO startConversation(ConversationDTO conversationDTO) {
        // Create conversation
        Conversation conversation = new Conversation();
        conversation.setId(UUID.randomUUID().toString());
        conversation.setTitle(conversationDTO.getTitle());
        conversation.setType(conversationDTO.getType());
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());

        Conversation savedConversation = conversationRepository.save(conversation);

        // Add participants
        for (String userId : conversationDTO.getParticipantIds()) {
            Participant participant = new Participant();
            participant.setId(UUID.randomUUID().toString());
            participant.setConversationId(savedConversation.getId());
            participant.setUserId(userId);
            participant.setJoinedAt(LocalDateTime.now());
            participantRepository.save(participant);
        }

        return convertToDTO(savedConversation);
    }

    @Override
    public MessageDTO markMessageAsRead(String messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        message.setRead(true);
        Message updatedMessage = messageRepository.save(message);

        return convertToMessageDTO(updatedMessage);
    }

    @Override
    @Transactional
    public void markConversationAsRead(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        // Find participant
        Participant participant = participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("User is not a participant in this conversation"));

        // Update last read message id to the last message in the conversation
        participant.setLastReadMessageId(conversation.getLastMessageId());
        participantRepository.save(participant);
    }

    private ConversationDTO convertToDTO(Conversation conversation) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setTitle(conversation.getTitle());
        dto.setType(conversation.getType());

        // Get participants
        List<Participant> participants = participantRepository.findByConversationId(conversation.getId());
        List<String> participantIds = participants.stream()
                .map(Participant::getUserId)
                .collect(Collectors.toList());

        dto.setParticipantIds(participantIds);

        // Get last message if available
        if (conversation.getLastMessageId() != null) {
            messageRepository.findById(conversation.getLastMessageId())
                    .ifPresent(lastMessage -> {
                        dto.setLastMessage(lastMessage.getContent());
                        dto.setLastMessageTime(lastMessage.getCreatedAt().toString());
                    });
        }

        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setUpdatedAt(conversation.getUpdatedAt());

        return dto;
    }

    private MessageDTO convertToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setConversationId(message.getConversationId());
        dto.setSenderId(message.getSenderId());
        dto.setContent(message.getContent());
        dto.setContentType(message.getContentType());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}