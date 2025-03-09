package com.recruitpme.notificationservice.repository;

import com.recruitpme.notificationservice.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    
    Optional<NotificationPreference> findByUserId(String userId);
}