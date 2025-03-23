package com.recruitpme.notificationservice.repository;

import com.recruitpme.notificationservice.entity.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, String> {
    List<EmailTemplate> findByCategory(String category);

    Optional<EmailTemplate> findByNameAndCategory(String name, String category);

    Optional<EmailTemplate> findByIsDefaultTrueAndCategory(String category);
}