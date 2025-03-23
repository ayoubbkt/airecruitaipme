package com.recruitpme.notificationservice.repository;

import com.recruitpme.notificationservice.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    List<Conversation> findAllByOrderByUpdatedAtDesc();

    @Query("SELECT c FROM Conversation c WHERE " +
            "c.candidateId = :candidateId AND " +
            "c.relatedEntityId = :relatedEntityId AND " +
            "c.conversationType = :conversationType")
    Optional<Conversation> findByParticipantsAndType(
            @Param("candidateId") String candidateId,
            @Param("relatedEntityId") String relatedEntityId,
            @Param("conversationType") String conversationType);
}