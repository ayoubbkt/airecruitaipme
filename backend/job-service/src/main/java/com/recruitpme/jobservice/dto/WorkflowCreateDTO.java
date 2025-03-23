package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowCreateDTO {
    @NotBlank(message = "Workflow name is required")
    private String name;

    private String description;

    private boolean isDefault;

    private List<StageCreateDTO> stages = new ArrayList<>();
}