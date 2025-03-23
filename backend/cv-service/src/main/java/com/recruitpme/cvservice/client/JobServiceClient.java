package com.recruitpme.cvservice.client;

import com.recruitpme.cvservice.dto.JobDetailDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "job-service", url = "${services.job-service.url}")
public interface JobServiceClient {


    @GetMapping("/api/jobs/{id}")
    JobDetailDTO getJobById(@PathVariable("id") String jobId);
}