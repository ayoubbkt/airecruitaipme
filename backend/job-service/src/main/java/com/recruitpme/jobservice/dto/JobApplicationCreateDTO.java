package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationCreateDTO {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    private String stageId;

    private Map<String, String> answers = new HashMap<>();

    private String coverLetter;

    private String resumeUrl;

    private String source;
}