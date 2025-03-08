package com.recruitpme.jobservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "ai-service", url = "${services.ai-service.url}")
public interface AIServiceClient {

    @PostMapping("/api/generate-job-description")
    String generateJobDescription(
            @RequestParam("title") String title, 
            @RequestParam("requirements") List<String> requirements
    );
}