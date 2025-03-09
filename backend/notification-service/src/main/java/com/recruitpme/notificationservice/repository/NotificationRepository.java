package com.recruitpme.notificationservice.repository;

import com.recruitpme.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<Notification> findByUserIdAndReadOrderByCreatedAtDesc(String userId, boolean read);
    
    long countByUserIdAndRead(String userId, boolean read);
}