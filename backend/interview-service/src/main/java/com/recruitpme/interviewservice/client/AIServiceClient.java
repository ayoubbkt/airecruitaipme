package com.recruitpme.interviewservice.client;

import com.recruitpme.interviewservice.dto.InterviewQuestionDTO;
import com.recruitpme.interviewservice.dto.InterviewQuestionsRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


import java.util.List;

@FeignClient(name = "ai-service", url = "${services.ai-service.url}")
public interface AIServiceClient {

    @PostMapping("/api/generate-interview-questions")
    List<InterviewQuestionDTO> generateInterviewQuestions(@RequestBody InterviewQuestionsRequestDTO request);
}