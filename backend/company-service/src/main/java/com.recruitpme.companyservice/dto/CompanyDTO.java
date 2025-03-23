package com.recruitpme.companyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDTO {
    private Long id;
    private String name;
    private String website;
    private String phone;
    private String logoUrl;
    private String industry;
    private String companySize;
    private String description;
}
