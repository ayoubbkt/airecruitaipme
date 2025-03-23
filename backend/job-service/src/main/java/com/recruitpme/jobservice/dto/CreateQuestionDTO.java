package com.recruitpme.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionDTO {

    @NotBlank(message = "Question text is required")
    private String text;

    @NotBlank(message = "Response type is required")
    private String responseType;  // short_text, paragraph, yes_no, dropdown, multiple_choice, number, file

    @NotBlank(message = "Visibility is required")
    private String visibility;    // public, private

    private List<String> options = new ArrayList<>();
}