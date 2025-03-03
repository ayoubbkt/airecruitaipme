package com.recruitpme.apigateway.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import com.recruitpme.apigateway.model.AnalysisResult;
import com.recruitpme.apigateway.model.CVIndex;
import java.util.concurrent.CompletableFuture;

public interface CVAnalysisService {
    CompletableFuture<AnalysisResult> analyzeCV(MultipartFile file, String jobId);
    Page<CVIndex> searchCVs(String query, Pageable pageable);
}