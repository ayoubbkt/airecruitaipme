package com.recruitpme.jobservice.repository;

import com.recruitpme.jobservice.entity.JobSkill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, Long> {
    Optional<JobSkill> findByName(String name);

    Page<JobSkill> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<JobSkill> findByCategory(String category);

    @Query("SELECT js FROM JobSkill js ORDER BY js.frequency DESC")
    List<JobSkill> findMostCommonSkills(Pageable pageable);

    @Query("SELECT DISTINCT js.category FROM JobSkill js")
    List<String> findDistinctCategories();

    @Query("SELECT js FROM JobSkill js WHERE js.name IN :skillNames")
    List<JobSkill> findByNames(@Param("skillNames") List<String> skillNames);
}