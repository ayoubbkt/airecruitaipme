package com.recruitpme.interviewservice.client;

import com.recruitpme.interviewservice.dto.JobDetailDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@FeignClient(name = "job-service", url = "${services.job-service.url}")
public interface JobServiceClient {

    @GetMapping("/api/jobs/{id}")
    JobDetailDTO getJobDetail(@PathVariable("id") Long id);
}