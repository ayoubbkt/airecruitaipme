package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDescriptionRequestDTO {
    private String title;
    private List<String> requirements;
    private List<String> responsibilities;
    private String industry;
    private String company;
}