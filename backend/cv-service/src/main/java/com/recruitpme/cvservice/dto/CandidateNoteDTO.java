package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CandidateNoteDTO {
    private String id;
    private String candidateId;
    private String authorId;
    private String authorName;
    private String authorInitials;
    private String content;
    private String type;
    private LocalDateTime date;
}