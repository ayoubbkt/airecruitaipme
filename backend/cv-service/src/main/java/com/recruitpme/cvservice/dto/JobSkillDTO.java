package com.recruitpme.cvservice.dto;

import lombok.Data;

@Data
public class JobSkillDTO {
    private String id;
    private String skillName;
    private boolean required;
}