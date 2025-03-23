package com.recruitpme.cvservice.repository;

import com.recruitpme.cvservice.entity.CVAnalysis;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CVAnalysisRepository extends ElasticsearchRepository<CVAnalysis, String> {

    Optional<CVAnalysis> findByCvIdAndJobId(String cvId, String jobId);

    List<CVAnalysis> findByCvId(String cvId);

    List<CVAnalysis> findByJobId(String jobId);

    List<CVAnalysis> findByJobIdOrderByScoreDesc(String jobId);

    List<CVAnalysis> findByScoreGreaterThanEqual(int minScore);
}