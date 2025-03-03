package com.recruitpme.apigateway.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import lombok.Data;
import java.util.List;

@Data
@Document(indexName = "cv_index")
public class CVIndex {
    @Id
    private String id;
    @Field(type = FieldType.Text)
    private String objectName;
    @Field(type = FieldType.Text)
    private List<String> skills;
    @Field(type = FieldType.Text)
    private String experience;
    @Field(type = FieldType.Integer)
    private int score;

    public CVIndex(String objectName, List<String> skills, String experience, int score) {
        this.objectName = objectName;
        this.skills = skills;
        this.experience = experience;
        this.score = score;
    }
}