package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionSetDTO {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @Size(min = 1, message = "At least one question is required")
    private List<String> questionIds = new ArrayList<>();
}