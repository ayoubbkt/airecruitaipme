package com.recruitpme.notificationservice.repository;

import com.recruitpme.notificationservice.entity.MessageTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageTemplateRepository extends JpaRepository<MessageTemplate, String> {
    List<MessageTemplate> findByCategory(String category);

    List<MessageTemplate> findByIsRequired(boolean isRequired);

    Optional<MessageTemplate> findByNameAndCategory(String name, String category);

    Optional<MessageTemplate> findByIsDefaultTrueAndCategory(String category);
}