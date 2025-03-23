package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.client.AIServiceClient;
import com.recruitpme.jobservice.client.AIServiceClient.JobDescriptionRequest;
import com.recruitpme.jobservice.dto.*;
import com.recruitpme.jobservice.entity.Job;
import com.recruitpme.jobservice.entity.Job.JobStatus;
import com.recruitpme.jobservice.entity.JobApplication;
import com.recruitpme.jobservice.entity.JobSkill;
import com.recruitpme.jobservice.exception.ResourceNotFoundException;
import com.recruitpme.jobservice.repository.JobApplicationRepository;
import com.recruitpme.jobservice.repository.JobRepository;
import com.recruitpme.jobservice.repository.JobSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.recruitpme.jobservice.client.CompanyServiceClient;
import com.recruitpme.jobservice.dto.DepartmentDTO;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final JobSkillRepository skillRepository;
    private final AIServiceClient aiServiceClient;
    private final CompanyServiceClient companyServiceClient;


    @Override
    @Transactional
    public JobDetailDTO createJob(JobCreateDTO jobDTO) {
        Job job = Job.builder()
                .title(jobDTO.getTitle())
                .description(jobDTO.getDescription())
                .location(jobDTO.getLocation())
                .jobType(jobDTO.getJobType())
                .workType(jobDTO.getWorkType())
                .minYearsExperience(jobDTO.getMinYearsExperience())
                .salaryRange(jobDTO.getSalaryRange())
                .department(jobDTO.getDepartment())
                .jobCode(jobDTO.getJobCode())
                .requiredSkills(jobDTO.getRequiredSkills())
                .preferredSkills(jobDTO.getPreferredSkills())
                .applicationFields(jobDTO.getApplicationFields())
                .customQuestions(jobDTO.getCustomQuestions())
                .hiringTeam(jobDTO.getHiringTeam())
                .workflowId(jobDTO.getWorkflowId())
                .jobBoards(jobDTO.getJobBoards())
                .status(jobDTO.getStatus() != null ? JobStatus.valueOf(jobDTO.getStatus()) : JobStatus.DRAFT)
                .build();

        Job savedJob = jobRepository.save(job);

        // Update skill frequency
        updateSkillFrequency(jobDTO.getRequiredSkills());
        updateSkillFrequency(jobDTO.getPreferredSkills());

        return mapToDetailDTO(savedJob);
    }

    @Override
    public List<JobListingDTO> getJobs(JobStatus status, Pageable pageable) {
        Page<Job> jobPage;

        if (status != null) {
            jobPage = jobRepository.findByStatus(status, pageable);
        } else {
            jobPage = jobRepository.findAll(pageable);
        }

        return jobPage.getContent().stream()
                .map(this::mapToListingDTO)
                .collect(Collectors.toList());
    }

    @Override
    public JobDetailDTO getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        return mapToDetailDTO(job);
    }

    @Override
    @Transactional
    public JobDetailDTO updateJob(Long id, JobCreateDTO jobDTO) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        job.setTitle(jobDTO.getTitle());
        job.setDescription(jobDTO.getDescription());
        job.setLocation(jobDTO.getLocation());
        job.setJobType(jobDTO.getJobType());
        job.setWorkType(jobDTO.getWorkType());
        job.setMinYearsExperience(jobDTO.getMinYearsExperience());
        job.setSalaryRange(jobDTO.getSalaryRange());
        job.setDepartment(jobDTO.getDepartment());
        job.setJobCode(jobDTO.getJobCode());
        job.setRequiredSkills(jobDTO.getRequiredSkills());
        job.setPreferredSkills(jobDTO.getPreferredSkills());
        job.setApplicationFields(jobDTO.getApplicationFields());
        job.setCustomQuestions(jobDTO.getCustomQuestions());
        job.setHiringTeam(jobDTO.getHiringTeam());
        job.setWorkflowId(jobDTO.getWorkflowId());
        job.setJobBoards(jobDTO.getJobBoards());

        if (jobDTO.getStatus() != null) {
            JobStatus newStatus = JobStatus.valueOf(jobDTO.getStatus());

            // If job is being published for the first time
            if (job.getStatus() != JobStatus.ACTIVE && newStatus == JobStatus.ACTIVE) {
                job.setPostedAt(LocalDateTime.now());
            }

            job.setStatus(newStatus);
        }

        Job updatedJob = jobRepository.save(job);

        // Update skill frequency
        updateSkillFrequency(jobDTO.getRequiredSkills());
        updateSkillFrequency(jobDTO.getPreferredSkills());

        return mapToDetailDTO(updatedJob);
    }

    @Override
    @Transactional
    public void deleteJob(Long id) {
        if (!jobRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job not found with id: " + id);
        }
        jobRepository.deleteById(id);
    }

    @Override
    public Page<JobListingDTO> searchJobs(JobSearchCriteriaDTO criteria, Pageable pageable) {
        // Build specification based on search criteria
        Specification<Job> spec = Specification.where(null);

        if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("title")), "%" + criteria.getKeyword().toLowerCase() + "%"),
                            cb.like(cb.lower(root.get("description")), "%" + criteria.getKeyword().toLowerCase() + "%")
                    )
            );
        }

        if (criteria.getLocation() != null && !criteria.getLocation().isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("location")), "%" + criteria.getLocation().toLowerCase() + "%")
            );
        }

        if (criteria.getJobTypes() != null && !criteria.getJobTypes().isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    root.get("jobType").in(criteria.getJobTypes())
            );
        }

        if (criteria.getWorkTypes() != null && !criteria.getWorkTypes().isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    root.get("workType").in(criteria.getWorkTypes())
            );
        }

        if (criteria.getDepartments() != null && !criteria.getDepartments().isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    root.get("department").in(criteria.getDepartments())
            );
        }

        if (criteria.getStatuses() != null && !criteria.getStatuses().isEmpty()) {
            List<JobStatus> statusList = criteria.getStatuses().stream()
                    .map(s -> JobStatus.valueOf(s.toUpperCase()))
                    .collect(Collectors.toList());

            spec = spec.and((root, query, cb) ->
                    root.get("status").in(statusList)
            );
        }

        if (criteria.getMinYearsExperience() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("minYearsExperience"), criteria.getMinYearsExperience())
            );
        }

        Page<Job> jobPage = jobRepository.findAll(spec, pageable);

        return jobPage.map(this::mapToListingDTO);
    }

    @Override
    public String generateJobDescription(JobDescriptionRequestDTO request) {
        JobDescriptionRequest aiRequest = new JobDescriptionRequest();
        aiRequest.setTitle(request.getTitle());
        aiRequest.setRequirements(request.getRequirements().toArray(new String[0]));

        if (request.getResponsibilities() != null) {
            aiRequest.setResponsibilities(request.getResponsibilities().toArray(new String[0]));
        }

        aiRequest.setIndustry(request.getIndustry());
        aiRequest.setCompany(request.getCompany());

        return aiServiceClient.generateJobDescription(aiRequest).getDescription();
    }

    @Override
    public List<DepartmentDTO> getDepartments() {
        // Récupérer tous les départements de company-service
        List<DepartmentDTO> departments = companyServiceClient.getAllDepartments();

        // Pour chaque département, enrichir avec le nombre d'offres actives
        return departments.stream()
                .map(department -> {
                    // Comptage des jobs actifs pour ce département
                    Long activeJobsCount = jobRepository.countByDepartmentAndStatusIs(
                            department.getName(),
                            "ACTIVE"
                    );

                    // Enrichir le DTO
                    department.setActiveJobsCount(activeJobsCount.intValue());
                    return department;
                })
                .collect(Collectors.toList());
    }

    // Méthode pour récupérer un seul département
    @Override
    public DepartmentDTO getDepartmentById(Long id) {
        DepartmentDTO department = companyServiceClient.getDepartmentById(id);
        if (department != null) {
            Long activeJobsCount = jobRepository.countByDepartmentAndStatusIs(
                    department.getName(),
                    "ACTIVE"
            );
            department.setActiveJobsCount(activeJobsCount.intValue());
        }
        return department;
    }

    @Override
    public List<JobSkillDTO> getMostCommonJobSkills(int limit) {
        List<JobSkill> skills = skillRepository.findMostCommonSkills(PageRequest.of(0, limit));

        return skills.stream()
                .map(this::mapToSkillDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobSkillDTO> getJobSkillsByCategory(String category) {
        List<JobSkill> skills = skillRepository.findByCategory(category);

        return skills.stream()
                .map(this::mapToSkillDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getSkillCategories() {
        return skillRepository.findDistinctCategories();
    }

    private void updateSkillFrequency(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return;
        }

        for (String skillName : skills) {
            JobSkill skill = skillRepository.findByName(skillName)
                    .orElse(JobSkill.builder()
                            .name(skillName)
                            .category("General") // Default category
                            .frequency(0)
                            .build());

            skill.setFrequency(skill.getFrequency() + 1);
            skillRepository.save(skill);
        }
    }

    private JobListingDTO mapToListingDTO(Job job) {
        // Calculate job statistics
        Long applicationsCount = applicationRepository.countByJobId(job.getId());

        JobStatsDTO metrics = JobStatsDTO.builder()
                .total(applicationsCount.intValue())
                .inReview(0) // These values would be calculated from application stages
                .inProgress(0)
                .inInterview(0)
                .offered(0)
                .hired(0)
                .rejected(0)
                .build();

        long daysAgo = ChronoUnit.DAYS.between(job.getCreatedAt(), LocalDateTime.now());

        return JobListingDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription() != null ?
                        (job.getDescription().length() > 200 ?
                                job.getDescription().substring(0, 200) + "..." :
                                job.getDescription()) :
                        null)
                .location(job.getLocation())
                .jobType(job.getJobType())
                .workType(job.getWorkType())
                .minYearsExperience(job.getMinYearsExperience())
                .salaryRange(job.getSalaryRange())
                .department(job.getDepartment())
                .status(job.getStatus())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .postedAt(job.getPostedAt())
                .isPublished(job.getStatus() == JobStatus.ACTIVE)
                .isInternal(job.getStatus() == JobStatus.INTERNAL)
                .isConfidential(job.getStatus() == JobStatus.CONFIDENTIAL)
                .applicationsCount(applicationsCount.intValue())
                .metrics(metrics)
                .daysAgo((int) daysAgo)
                .build();
    }

    private JobDetailDTO mapToDetailDTO(Job job) {
        // Calculate job statistics
        Long applicationsCount = applicationRepository.countByJobId(job.getId());
        Long qualifiedCount = applicationRepository.countQualifiedByJobId(job.getId());
        Long interviewsCount = applicationRepository.countInterviewsByJobId(job.getId());
        Long hiredCount = applicationRepository.countHiredByJobId(job.getId());

        JobStatsDTO metrics = JobStatsDTO.builder()
                .total(applicationsCount.intValue())
                .inReview(0) // These values would be calculated from application stages
                .inProgress(0)
                .inInterview(0)
                .offered(0)
                .hired(hiredCount.intValue())
                .rejected(0)
                .evaluation(applicationsCount.intValue() - interviewsCount.intValue()) // Simplistic calculation
                .interview(interviewsCount.intValue())
                .build();

        // Get recent applications
        List<JobApplication> recentApps = applicationRepository.findRecentApplicationsByJobId(
                job.getId(), PageRequest.of(0, 3));

        List<JobApplicationDTO> recentApplications = recentApps.stream()
                .map(app -> JobApplicationDTO.builder()
                        .id(app.getId())
                        .jobId(app.getJobId())
                        .candidateId(app.getCandidateId())
                        .stageId(app.getStageId())
                        .status(app.getStatus())
                        .createdAt(app.getCreatedAt())
                        // Note: Normally you would fetch candidate details from a candidate service
                        .build())
                .collect(Collectors.toList());

        return JobDetailDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .jobType(job.getJobType())
                .workType(job.getWorkType())
                .minYearsExperience(job.getMinYearsExperience())
                .salaryRange(job.getSalaryRange())
                .department(job.getDepartment())
                .jobCode(job.getJobCode())
                .status(job.getStatus())
                .requiredSkills(job.getRequiredSkills())
                .preferredSkills(job.getPreferredSkills())
                .applicationFields(job.getApplicationFields())
                .customQuestions(job.getCustomQuestions())
                .hiringTeam(job.getHiringTeam())
                .workflowId(job.getWorkflowId())
                .jobBoards(job.getJobBoards())
                .companyId(job.getCompanyId())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .postedAt(job.getPostedAt())
                .expiresAt(job.getExpiresAt())
                .metrics(metrics)
                .recentApplications(recentApplications)
                .isPublished(job.getStatus() == JobStatus.ACTIVE)
                .applicationsCount(applicationsCount.intValue())
                .qualifiedCandidatesCount(qualifiedCount.intValue())
                .interviewsCount(interviewsCount.intValue())
                .hiredCount(hiredCount.intValue())
                .build();
    }

    private JobSkillDTO mapToSkillDTO(JobSkill skill) {
        return JobSkillDTO.builder()
                .id(skill.getId())
                .name(skill.getName())
                .category(skill.getCategory())
                .frequency(skill.getFrequency())
                .build();
    }
}