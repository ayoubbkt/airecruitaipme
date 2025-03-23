package com.recruitpme.jobservice.repository;

import com.recruitpme.jobservice.entity.Stage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StageRepository extends JpaRepository<Stage, String> {
    List<Stage> findByWorkflowIdOrderByOrder(String workflowId);

    void deleteByWorkflowId(String workflowId);

    int countByWorkflowId(String workflowId);
}