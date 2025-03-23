package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StageUpdateDTO {
    @NotBlank(message = "Stage name is required")
    private String name;

    private String type;

    private Integer dueDays;

    private boolean isVisible;
}