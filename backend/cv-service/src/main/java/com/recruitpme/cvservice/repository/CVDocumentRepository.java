package com.recruitpme.cvservice.repository;

import com.recruitpme.cvservice.entity.CVDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CVDocumentRepository extends ElasticsearchRepository<CVDocument, String> {

    Optional<CVDocument> findById(String id);

    List<CVDocument> findByCandidateId(String candidateId);

    List<CVDocument> findByAnalyzedFalse();
}