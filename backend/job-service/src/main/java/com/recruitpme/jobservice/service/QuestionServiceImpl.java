package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.dto.QuestionDTO;
import com.recruitpme.jobservice.dto.QuestionSetDTO;
import com.recruitpme.jobservice.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QuestionServiceImpl implements QuestionService {

    // In-memory storage for questions and question sets
    private final Map<String, QuestionDTO> questions = new ConcurrentHashMap<>();
    private final Map<String, QuestionSetDTO> questionSets = new ConcurrentHashMap<>();

    // Initialize with some example questions
    public QuestionServiceImpl() {
        // Create some default questions
        createDefaultQuestions();
    }

    private void createDefaultQuestions() {
        List<QuestionDTO> defaultQuestions = new ArrayList<>();

        defaultQuestions.add(QuestionDTO.builder()
                .id("q1")
                .text("Décrivez votre personnalité en quelques phrases.")
                .responseType("short_text")
                .visibility("public")
                .isOptional(true)
                .createdAt(LocalDateTime.now())
                .build());

        defaultQuestions.add(QuestionDTO.builder()
                .id("q2")
                .text("Décrivez votre travail idéal.")
                .responseType("paragraph")
                .visibility("public")
                .isOptional(true)
                .createdAt(LocalDateTime.now())
                .build());

        defaultQuestions.add(QuestionDTO.builder()
                .id("q3")
                .text("Quelles sont vos attentes salariales?")
                .responseType("short_text")
                .visibility("private")
                .isOptional(false)
                .createdAt(LocalDateTime.now())
                .build());

        defaultQuestions.add(QuestionDTO.builder()
                .id("q4")
                .text("Qu'écoutez-vous pendant que vous travaillez?")
                .responseType("short_text")
                .visibility("public")
                .isOptional(true)
                .createdAt(LocalDateTime.now())
                .build());

        defaultQuestions.add(QuestionDTO.builder()
                .id("q5")
                .text("Que faites-vous pendant votre temps libre?")
                .responseType("short_text")
                .visibility("public")
                .isOptional(true)
                .createdAt(LocalDateTime.now())
                .build());

        // Add questions to the map
        for (QuestionDTO q : defaultQuestions) {
            questions.put(q.getId(), q);
        }

        // Create a default question set
        QuestionSetDTO defaultSet = QuestionSetDTO.builder()
                .id("set1")
                .name("Questions standards")
                .description("Ensemble de questions standards pour toutes les offres.")
                .questionIds(Arrays.asList("q1", "q2", "q3"))
                .createdAt(LocalDateTime.now())
                .build();

        questionSets.put(defaultSet.getId(), defaultSet);
    }

    @Override
    public List<QuestionDTO> getAllQuestions() {
        return new ArrayList<>(questions.values());
    }

    @Override
    public QuestionDTO getQuestionById(String id) {
        QuestionDTO question = questions.get(id);
        if (question == null) {
            throw new ResourceNotFoundException("Question not found with id: " + id);
        }
        return question;
    }

    @Override
    public QuestionDTO createQuestion(QuestionDTO questionDTO) {
        String id = UUID.randomUUID().toString();
        questionDTO.setId(id);
        questionDTO.setCreatedAt(LocalDateTime.now());

        questions.put(id, questionDTO);
        return questionDTO;
    }

    @Override
    public QuestionDTO updateQuestion(String id, QuestionDTO questionDTO) {
        if (!questions.containsKey(id)) {
            throw new ResourceNotFoundException("Question not found with id: " + id);
        }

        QuestionDTO existingQuestion = questions.get(id);

        // Preserve ID and creation date
        questionDTO.setId(id);
        questionDTO.setCreatedAt(existingQuestion.getCreatedAt());
        questionDTO.setUpdatedAt(LocalDateTime.now());

        questions.put(id, questionDTO);
        return questionDTO;
    }

    @Override
    public void deleteQuestion(String id) {
        if (!questions.containsKey(id)) {
            throw new ResourceNotFoundException("Question not found with id: " + id);
        }

        questions.remove(id);

        // Remove the question from all question sets
        for (QuestionSetDTO set : questionSets.values()) {
            if (set.getQuestionIds().contains(id)) {
                List<String> updatedIds = new ArrayList<>(set.getQuestionIds());
                updatedIds.remove(id);
                set.setQuestionIds(updatedIds);
            }
        }
    }

    @Override
    public List<QuestionSetDTO> getAllQuestionSets() {
        return new ArrayList<>(questionSets.values());
    }

    @Override
    public QuestionSetDTO getQuestionSetById(String id) {
        QuestionSetDTO questionSet = questionSets.get(id);
        if (questionSet == null) {
            throw new ResourceNotFoundException("Question set not found with id: " + id);
        }
        return questionSet;
    }

    @Override
    public QuestionSetDTO createQuestionSet(QuestionSetDTO questionSetDTO) {
        String id = UUID.randomUUID().toString();
        questionSetDTO.setId(id);
        questionSetDTO.setCreatedAt(LocalDateTime.now());

        // Validate that all question IDs exist
        if (questionSetDTO.getQuestionIds() != null) {
            for (String qId : questionSetDTO.getQuestionIds()) {
                if (!questions.containsKey(qId)) {
                    throw new ResourceNotFoundException("Question not found with id: " + qId);
                }
            }
        } else {
            questionSetDTO.setQuestionIds(new ArrayList<>());
        }

        questionSets.put(id, questionSetDTO);
        return questionSetDTO;
    }

    @Override
    public QuestionSetDTO updateQuestionSet(String id, QuestionSetDTO questionSetDTO) {
        if (!questionSets.containsKey(id)) {
            throw new ResourceNotFoundException("Question set not found with id: " + id);
        }

        QuestionSetDTO existingSet = questionSets.get(id);

        // Preserve ID and creation date
        questionSetDTO.setId(id);
        questionSetDTO.setCreatedAt(existingSet.getCreatedAt());
        questionSetDTO.setUpdatedAt(LocalDateTime.now());

        // Validate question IDs
        if (questionSetDTO.getQuestionIds() != null) {
            for (String qId : questionSetDTO.getQuestionIds()) {
                if (!questions.containsKey(qId)) {
                    throw new ResourceNotFoundException("Question not found with id: " + qId);
                }
            }
        }

        questionSets.put(id, questionSetDTO);
        return questionSetDTO;
    }

    @Override
    public void deleteQuestionSet(String id) {
        if (!questionSets.containsKey(id)) {
            throw new ResourceNotFoundException("Question set not found with id: " + id);
        }

        questionSets.remove(id);
    }
}