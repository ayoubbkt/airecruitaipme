package com.recruitpme.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDetailDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String title;
    private String email;
    private String phone;
    private String status;
    // Additional fields as needed
}