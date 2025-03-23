package com.recruitpme.cvservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDateTime;

@Data
@Document(indexName = "cv_documents")
public class CVDocument {

    @Id
    private String id;

    @Field(type = FieldType.Text)
    private String originalFilename;

    @Field(type = FieldType.Text)
    private String contentType;

    @Field(type = FieldType.Long)
    private long size;

    @Field(type = FieldType.Text)
    private String extractedText;

    @Field(type = FieldType.Keyword)
    private String candidateId;

    @Field(type = FieldType.Date)
    private LocalDateTime uploadedAt;

    @Field(type = FieldType.Boolean)
    private boolean analyzed;
}