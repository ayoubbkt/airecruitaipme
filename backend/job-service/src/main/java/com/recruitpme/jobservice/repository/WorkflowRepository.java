package com.recruitpme.jobservice.repository;

import com.recruitpme.jobservice.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, String> {
    List<Workflow> findByCompanyId(String companyId);

    Optional<Workflow> findByCompanyIdAndIsDefaultTrue(String companyId);

    boolean existsByNameAndCompanyId(String name, String companyId);
}