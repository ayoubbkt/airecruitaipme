package com.recruitpme.userservice.dto;

import lombok.Data;

@Data
public class UserPreferenceDTO {
    private Long id;
    private Long userId;
    private String language;
    private String timezone;
    private String theme;
    private String dashboardLayout;
}