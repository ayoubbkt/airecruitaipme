package com.recruitpme.jobservice.dto;

import lombok.Data;

@Data
public class JobSkillDTO {
    private Long id;
    private String name;
    private boolean required;
    private int importance;
}