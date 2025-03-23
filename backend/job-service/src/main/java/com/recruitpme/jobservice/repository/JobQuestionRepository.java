package com.recruitpme.jobservice.repository;

import com.recruitpme.jobservice.entity.JobQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobQuestionRepository extends JpaRepository<JobQuestion, String> {

    List<JobQuestion> findByJobIdOrderByOrder(String jobId);

    List<JobQuestion> findByJobId(Long jobId);

    void deleteByJobId(String jobId);

    void deleteByQuestionId(String questionId);

    void deleteByQuestionSetId(String questionSetId);
}