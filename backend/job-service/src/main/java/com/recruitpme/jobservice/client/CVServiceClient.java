package com.recruitpme.jobservice.client;

import com.recruitpme.jobservice.dto.CVDetailDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "cv-service", url = "${cv-service.url}")
public interface CVServiceClient {

    @GetMapping("/api/cv/{id}")
    CVDetailDTO getCandidateDetails(@PathVariable("id") String id);

    @GetMapping("/api/candidates/{id}")
    CVDetailDTO getCandidateById(@PathVariable("id") String id);

    @PostMapping("/api/cv/analyze-match")
    double analyzeCandidateMatch(@RequestBody CandidateMatchRequest request);

    class CandidateMatchRequest {
        private String cvId;
        private String jobId;
        private List<String> requiredSkills;
        private List<String> preferredSkills;

        // Getters and setters
        public String getCvId() { return cvId; }
        public void setCvId(String cvId) { this.cvId = cvId; }

        public String getJobId() { return jobId; }
        public void setJobId(String jobId) { this.jobId = jobId; }

        public List<String> getRequiredSkills() { return requiredSkills; }
        public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

        public List<String> getPreferredSkills() { return preferredSkills; }
        public void setPreferredSkills(List<String> preferredSkills) { this.preferredSkills = preferredSkills; }
    }
}