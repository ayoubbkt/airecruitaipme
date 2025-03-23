package com.recruitpme.notificationservice.repository;

import com.recruitpme.notificationservice.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversationId = :conversationId AND m.read = false AND m.senderId != :userId")
    int countUnreadMessagesByConversation(@Param("conversationId") String conversationId,
                                          @Param("userId") String userId);

    @Query("SELECT COUNT(m) FROM Message m " +
            "JOIN Conversation c ON m.conversationId = c.id " +
            "WHERE m.read = false AND m.senderId != :userId")
    int countTotalUnreadMessages(@Param("userId") String userId);
}