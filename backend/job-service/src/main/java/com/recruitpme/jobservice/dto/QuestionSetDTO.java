package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionSetDTO {
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotEmpty(message = "Question set must contain at least one question")
    private List<String> questionIds;

    private Long companyId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}