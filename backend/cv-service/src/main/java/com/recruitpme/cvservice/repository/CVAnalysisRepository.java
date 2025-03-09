// recruitpme/backend/cv-service/src/main/java/com/recruitpme/cvservice/repository/CVAnalysisRepository.java (méthodes manquantes)
package com.recruitpme.cvservice.repository;

import com.recruitpme.cvservice.entity.CVAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CVAnalysisRepository extends JpaRepository<CVAnalysis, Long> {
    List<CVAnalysis> findByCvDocumentId(String cvDocumentId);
    
    Optional<CVAnalysis> findTopByCvDocumentIdOrderByCreatedAtDesc(String cvDocumentId);
    
    List<CVAnalysis> findByJobIdOrderByScoreDesc(Long jobId);
    
    long countByScoreGreaterThanEqualAndCreatedAtAfter(Integer score, LocalDateTime date);
    
    long countByScoreGreaterThanEqualAndCreatedAtBetween(Integer score, LocalDateTime startDate, LocalDateTime endDate);
}