package com.recruitpme.interviewservice.client;

import com.recruitpme.interviewservice.dto.CVDetailDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "cv-service", url = "${services.cv-service.url}")
public interface CVServiceClient {

    @GetMapping("/api/cv/{id}")
    CVDetailDTO getCVDetail(@PathVariable("id") String id);
}