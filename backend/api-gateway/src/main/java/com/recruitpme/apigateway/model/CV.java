package com.recruitpme.apigateway.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class CV {
    @Id
    private String id;
    private String fullName;
    private String emailHash;
    private String phoneHash;
    private boolean anonymized;
}