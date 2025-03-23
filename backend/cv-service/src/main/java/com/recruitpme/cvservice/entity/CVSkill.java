package com.recruitpme.cvservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@Document(indexName = "cv_skills")
public class CVSkill {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String cvId;

    @Field(type = FieldType.Keyword)
    private String skillName;

    @Field(type = FieldType.Integer)
    private int confidence;
}