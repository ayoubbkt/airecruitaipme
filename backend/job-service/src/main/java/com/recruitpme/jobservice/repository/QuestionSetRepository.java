package com.recruitpme.jobservice.repository;

import com.recruitpme.jobservice.entity.QuestionSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionSetRepository extends JpaRepository<QuestionSet, String> {
    List<QuestionSet> findAllByOrderByCreatedAtDesc();
}