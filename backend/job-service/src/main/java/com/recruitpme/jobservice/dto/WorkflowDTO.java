package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDTO {
    private String id;
    private String name;
    private String description;
    private boolean isDefault;
    private Integer stageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StageDTO> stages = new ArrayList<>();
}