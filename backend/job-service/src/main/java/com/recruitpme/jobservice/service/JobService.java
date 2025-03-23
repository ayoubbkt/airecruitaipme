package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.dto.*;
import com.recruitpme.jobservice.entity.Job.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface JobService {

    JobDetailDTO createJob(JobCreateDTO jobDTO);

    List<JobListingDTO> getJobs(JobStatus status, Pageable pageable);

    JobDetailDTO getJobById(Long id);

    JobDetailDTO updateJob(Long id, JobCreateDTO jobDTO);

    void deleteJob(Long id);

    Page<JobListingDTO> searchJobs(JobSearchCriteriaDTO criteria, Pageable pageable);

    String generateJobDescription(JobDescriptionRequestDTO request);

    List<DepartmentDTO> getDepartments();

    // Ajoutez cette méthode à l'interface
    DepartmentDTO getDepartmentById(Long id);

    List<JobSkillDTO> getMostCommonJobSkills(int limit);

    List<JobSkillDTO> getJobSkillsByCategory(String category);

    List<String> getSkillCategories();
}