package com.recruitpme.cvservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class CVUploadResponseDTO {
    private List<String> fileIds;
}