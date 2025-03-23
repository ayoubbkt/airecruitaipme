package com.recruitpme.notificationservice.client;

import com.recruitpme.notificationservice.dto.CandidateDetailDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "cv-service", url = "${cv-service.url}")
public interface CVServiceClient {


    @GetMapping("/api/candidates/{id}")
    CandidateDetailDTO getCandidateById(@PathVariable("id") String id);
}