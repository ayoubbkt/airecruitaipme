package com.recruitpme.companyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUpdateLocationDTO {
    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;


    @NotBlank(message = "Country is required")
    private String country;

    private String postalCode;
    private boolean isHeadquarters;
}