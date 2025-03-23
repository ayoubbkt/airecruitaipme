package com.recruitpme.apigateway.client;

import org.springframework.stereotype.Component;
import com.recruitpme.apigateway.model.AnalysisResult;
import java.util.List; 
@Component
public class AIServiceClient {


    public static class AnalysisRequest {
        private String text;
        private String jobId;

        public AnalysisRequest(String text, String jobId) {
            this.text = text;
            this.jobId = jobId;
        }

        public String getText() {
            return text;
        }

        public String getJobId() {
            return jobId;
        }
    }

    public AnalysisResult analyze(AnalysisRequest request) {
        // TODO: Implémenter l'appel réel au service ai-service
        AnalysisResult result = new AnalysisResult();
        result.setSkills(List.of("Java", "Spring Boot"));
        result.setExperience("5 years");
        result.setScore(85);
        return result;
    }
}