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
public class DepartmentDTO {
    private Long id;

    @NotBlank(message = "Department name is required")
    private String name;

    private String description;

    private Long companyId;

    private int activeJobsCount;
}