package com.recruitpme.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateInfoDTO {
    private String id;
    private String name;
    private String position;
    private String email;
}