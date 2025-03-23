package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StageTransitionDTO {
    @NotBlank(message = "New stage ID is required")
    private String newStageId;

    private String note;
}