package com.recruitpme.companyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyLocationDTO {
    private Long id;
    private String address;
    private String city;
    private String country;
    private String postalCode;
    private boolean isHeadquarters;
}
