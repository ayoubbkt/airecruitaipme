package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CandidateDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String title;
    private String location;
    private List<String> skills;
    private int score;
    private int yearsOfExperience;
    private String status;
    private String stage;
    private String source;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CandidateNoteDTO> notes;
}