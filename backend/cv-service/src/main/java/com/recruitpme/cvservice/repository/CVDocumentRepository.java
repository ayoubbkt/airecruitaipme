// recruitpme/backend/cv-service/src/main/java/com/recruitpme/cvservice/repository/CVDocumentRepository.java (méthodes manquantes)
package com.recruitpme.cvservice.repository;

import com.recruitpme.cvservice.entity.CVDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;

@Repository
public interface CVDocumentRepository extends JpaRepository<CVDocument, String> {
     
    List<CVDocument> findByJobId(Long jobId);
    
    long countByUploadedAtAfter(LocalDateTime date);
    
    long countByUploadedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<CVDocument> findByUploadedAtAfterOrderByUploadedAtDesc(LocalDateTime date, Pageable pageable);
}