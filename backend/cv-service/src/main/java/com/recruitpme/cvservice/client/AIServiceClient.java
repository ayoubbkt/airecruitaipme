package com.recruitpme.cvservice.client;

import com.recruitpme.cvservice.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "ai-service", url = "${services.ai-service.url}")
public interface AIServiceClient {


    @PostMapping("/api/ai/analyze-cv")
    AnalysisResultDTO analyzeCv(@RequestBody String cvText, @RequestParam("jobId") String jobId);

    @PostMapping("/api/ai/generate-questions")
    List<InterviewQuestionDTO> generateInterviewQuestions(@RequestBody InterviewQuestionRequestDTO request);
}