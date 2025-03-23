package com.recruitpme.companyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUpdateDepartmentDTO {
    @NotBlank(message = "Department name is required")
    private String name;

    private String description;
}
