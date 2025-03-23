package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private String id;

    @NotBlank(message = "Question text is required")
    private String text;

    @NotBlank(message = "Response type is required")
    private String responseType;

    private String visibility = "public";

    private Boolean isOptional = true;

    private List<String> options = new ArrayList<>();

    private Long companyId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}