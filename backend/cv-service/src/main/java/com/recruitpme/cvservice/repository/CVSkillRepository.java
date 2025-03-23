package com.recruitpme.cvservice.repository;

import com.recruitpme.cvservice.entity.CVSkill;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CVSkillRepository extends ElasticsearchRepository<CVSkill, String> {

    List<CVSkill> findByCvId(String cvId);

    List<CVSkill> findBySkillNameContainingIgnoreCase(String skillName);
}