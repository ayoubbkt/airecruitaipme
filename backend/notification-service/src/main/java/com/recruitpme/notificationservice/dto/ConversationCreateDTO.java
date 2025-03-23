package com.recruitpme.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationCreateDTO {
    @NotNull
    private String candidateId;

    private String initiatorId;

    @NotBlank
    private String conversationType;

    private String relatedEntityId;

    private String initialMessage;
}