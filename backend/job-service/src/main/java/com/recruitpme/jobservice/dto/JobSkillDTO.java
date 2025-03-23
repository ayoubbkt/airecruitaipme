package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSkillDTO {
    private Long id;
    private String name;
    private String category;
    private Integer frequency;
}