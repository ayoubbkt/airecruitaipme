package com.recruitpme.notificationservice.repository;

import com.recruitpme.notificationservice.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<Notification> findByUserIdAndReadOrderByCreatedAtDesc(String userId, boolean read);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.read = false")
    Long countUnreadByUserId(@Param("userId") String userId);
}