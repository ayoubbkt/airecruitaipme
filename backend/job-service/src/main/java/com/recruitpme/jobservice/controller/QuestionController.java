package com.recruitpme.jobservice.controller;

import com.recruitpme.jobservice.dto.QuestionDTO;
import com.recruitpme.jobservice.dto.QuestionSetDTO;
import com.recruitpme.jobservice.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/custom")
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable String id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PostMapping
    public ResponseEntity<QuestionDTO> createQuestion(@Valid @RequestBody QuestionDTO questionDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questionService.createQuestion(questionDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionDTO> updateQuestion(
            @PathVariable String id,
            @Valid @RequestBody QuestionDTO questionDTO) {
        return ResponseEntity.ok(questionService.updateQuestion(id, questionDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sets")
    public ResponseEntity<List<QuestionSetDTO>> getAllQuestionSets() {
        return ResponseEntity.ok(questionService.getAllQuestionSets());
    }

    @GetMapping("/sets/{id}")
    public ResponseEntity<QuestionSetDTO> getQuestionSetById(@PathVariable String id) {
        return ResponseEntity.ok(questionService.getQuestionSetById(id));
    }

    @PostMapping("/sets")
    public ResponseEntity<QuestionSetDTO> createQuestionSet(@Valid @RequestBody QuestionSetDTO questionSetDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questionService.createQuestionSet(questionSetDTO));
    }

    @PutMapping("/sets/{id}")
    public ResponseEntity<QuestionSetDTO> updateQuestionSet(
            @PathVariable String id,
            @Valid @RequestBody QuestionSetDTO questionSetDTO) {
        return ResponseEntity.ok(questionService.updateQuestionSet(id, questionSetDTO));
    }

    @DeleteMapping("/sets/{id}")
    public ResponseEntity<Void> deleteQuestionSet(@PathVariable String id) {
        questionService.deleteQuestionSet(id);
        return ResponseEntity.noContent().build();
    }
}