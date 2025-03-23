package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.dto.QuestionDTO;
import com.recruitpme.jobservice.dto.QuestionSetDTO;

import java.util.List;

public interface QuestionService {

    List<QuestionDTO> getAllQuestions();

    QuestionDTO getQuestionById(String id);

    QuestionDTO createQuestion(QuestionDTO questionDTO);

    QuestionDTO updateQuestion(String id, QuestionDTO questionDTO);

    void deleteQuestion(String id);

    List<QuestionSetDTO> getAllQuestionSets();

    QuestionSetDTO getQuestionSetById(String id);

    QuestionSetDTO createQuestionSet(QuestionSetDTO questionSetDTO);

    QuestionSetDTO updateQuestionSet(String id, QuestionSetDTO questionSetDTO);

    void deleteQuestionSet(String id);
}