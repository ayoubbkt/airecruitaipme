package com.recruitpme.jobservice.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ai-service", url = "${ai-service.url:http://ai-service:8085}", path = "/api/ai")
public interface AIServiceClient {

    @PostMapping("/generate-job-description")
    JobDescriptionResponse generateJobDescription(@RequestBody JobDescriptionRequest request);

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    class JobDescriptionRequest {
        private String title;
        private String[] requirements;
        private String[] responsibilities;
        private String industry;
        private String company;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    class JobDescriptionResponse {
        private String description;
    }
}