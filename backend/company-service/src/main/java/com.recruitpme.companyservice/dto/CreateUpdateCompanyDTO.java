package com.recruitpme.companyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUpdateCompanyDTO {
    @NotBlank(message = "Company name is required")
    private String name;


    private String website;
    private String phone;
    private String logoUrl;
    private String industry;
    private String companySize;
    private String description;
}