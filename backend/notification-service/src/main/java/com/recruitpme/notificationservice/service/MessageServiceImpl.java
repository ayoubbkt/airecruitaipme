package com.recruitpme.notificationservice.service;

import com.recruitpme.notificationservice.client.CVServiceClient;
import com.recruitpme.notificationservice.dto.*;
import com.recruitpme.notificationservice.entity.Conversation;
import com.recruitpme.notificationservice.entity.Message;
import com.recruitpme.notificationservice.exception.ResourceNotFoundException;
import com.recruitpme.notificationservice.repository.ConversationRepository;
import com.recruitpme.notificationservice.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private CVServiceClient cvServiceClient;

    @Override
    public List<ConversationDTO> getConversations(String filter) {
        List<Conversation> conversations = conversationRepository.findAllByOrderByUpdatedAtDesc();

        // Apply filter if provided
        if (filter != null && !filter.isEmpty()) {
            if ("your-conversations".equals(filter)) {
                // Filter logic would go here
            } else if ("all-conversations".equals(filter)) {
                // No filter needed, return all
            }
        }

        return conversations.stream()
                .map(this::convertToConversationDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> getMessages(String conversationId) {
        if (!conversationRepository.existsById(conversationId)) {
            throw new ResourceNotFoundException("Conversation not found with id: " + conversationId);
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ConversationDTO createConversation(ConversationCreateDTO conversationDTO) {
        // Check if a conversation already exists with these participants and type
        Optional<Conversation> existingConversation = conversationRepository.findByParticipantsAndType(
                conversationDTO.getCandidateId(),
                conversationDTO.getRelatedEntityId(),
                conversationDTO.getConversationType()
        );

        if (existingConversation.isPresent()) {
            // If conversation exists and has initial message, send it
            if (conversationDTO.getInitialMessage() != null && !conversationDTO.getInitialMessage().isEmpty()) {
                MessageCreateDTO messageDTO = new MessageCreateDTO();
                messageDTO.setSenderId(conversationDTO.getInitiatorId());
                messageDTO.setContent(conversationDTO.getInitialMessage());

                sendMessage(existingConversation.get().getId(), messageDTO);
            }

            return convertToConversationDTO(existingConversation.get());
        }

        // Get candidate details from CV service
        CandidateDetailDTO candidateDetail = cvServiceClient.getCandidateById(conversationDTO.getCandidateId());

        // Create new conversation
        Conversation conversation = new Conversation();
        conversation.setId(UUID.randomUUID().toString());
        conversation.setCandidateId(conversationDTO.getCandidateId());
        conversation.setCandidateName(candidateDetail.getFirstName() + " " + candidateDetail.getLastName());
        conversation.setCandidatePosition(candidateDetail.getTitle());
        conversation.setCandidateEmail(candidateDetail.getEmail());
        conversation.setConversationType(conversationDTO.getConversationType());
        conversation.setRelatedEntityId(conversationDTO.getRelatedEntityId());
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());

        Conversation savedConversation = conversationRepository.save(conversation);

        // If there's an initial message, send it
        if (conversationDTO.getInitialMessage() != null && !conversationDTO.getInitialMessage().isEmpty()) {
            MessageCreateDTO messageDTO = new MessageCreateDTO();
            messageDTO.setSenderId(conversationDTO.getInitiatorId());
            messageDTO.setContent(conversationDTO.getInitialMessage());

            sendMessage(savedConversation.getId(), messageDTO);

            // Refresh conversation after sending message to get updated data
            savedConversation = conversationRepository.findById(savedConversation.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found after creation"));
        }

        return convertToConversationDTO(savedConversation);
    }

    @Override
    public MessageDTO sendMessage(String conversationId, MessageCreateDTO messageDTO) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        // Create and save the message
        Message message = new Message();
        message.setId(UUID.randomUUID().toString());
        message.setConversationId(conversationId);
        message.setSenderId(messageDTO.getSenderId());
        message.setContent(messageDTO.getContent());
        message.setRead(false);
        message.setCreatedAt(LocalDateTime.now());

        // Get sender details if needed
        // Could make a call to user service to get sender name
        message.setSenderName("User " + messageDTO.getSenderId());

        Message savedMessage = messageRepository.save(message);

        // Update conversation with last message details
        conversation.setLastMessageId(savedMessage.getId());
        conversation.setLastMessageTime(savedMessage.getCreatedAt());
        conversation.setUpdatedAt(LocalDateTime.now());

        conversationRepository.save(conversation);

        return convertToMessageDTO(savedMessage);
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
    public UnreadCountDTO getUnreadCount(String userId) {
        int unreadMessages = messageRepository.countTotalUnreadMessages(userId);
        int totalConversations = conversationRepository.findAll().size();

        return new UnreadCountDTO(unreadMessages, totalConversations);
    }

    private ConversationDTO convertToConversationDTO(Conversation conversation) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());

        // Set candidate info
        CandidateInfoDTO candidateInfo = new CandidateInfoDTO(
                conversation.getCandidateId(),
                conversation.getCandidateName(),
                conversation.getCandidatePosition(),
                conversation.getCandidateEmail()
        );
        dto.setCandidate(candidateInfo);

        // Try to get last message if exists
        if (conversation.getLastMessageId() != null) {
            messageRepository.findById(conversation.getLastMessageId())
                    .ifPresent(lastMessage -> dto.setLastMessage(lastMessage.getContent()));
        }

        dto.setLastMessageTime(conversation.getLastMessageTime());

        // Count unread messages for this user in this conversation
        // This could be a placeholder, actual implementation would need the user ID
        dto.setUnreadCount(0);

        dto.setConversationType(conversation.getConversationType());
        dto.setRelatedEntityId(conversation.getRelatedEntityId());

        return dto;
    }

    private MessageDTO convertToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setConversationId(message.getConversationId());
        dto.setSenderId(message.getSenderId());
        dto.setSenderName(message.getSenderName());
        dto.setContent(message.getContent());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());

        return dto;
    }
}