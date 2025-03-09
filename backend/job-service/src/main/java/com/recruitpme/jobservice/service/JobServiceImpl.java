package com.recruitpme.jobservice.service;

import com.recruitpme.jobservice.client.AIServiceClient;
import com.recruitpme.jobservice.dto.*;
import com.recruitpme.jobservice.entity.Job;
import com.recruitpme.jobservice.exception.ResourceNotFoundException;
import com.recruitpme.jobservice.repository.JobApplicationRepository;
import com.recruitpme.jobservice.repository.JobRepository;
import com.recruitpme.jobservice.repository.JobSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.IndexQuery;
import org.springframework.data.elasticsearch.core.query.IndexQueryBuilder;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ElasticsearchOperations elasticsearchOperations;
    private final AIServiceClient aiServiceClient;

    @Override
    @Transactional(readOnly = true)
    public List<JobListingDTO> getJobs(String status, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        
        List<Job> jobs;
        if (status != null && !status.isEmpty()) {
            jobs = jobRepository.findByStatusOrderByCreatedAtDesc(status, pageRequest);
        } else {
            jobs = jobRepository.findAllByOrderByCreatedAtDesc(pageRequest);
        }
        
        return jobs.stream()
                .map(this::convertToListingDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobListingDTO> getActiveJobs() {
        List<Job> jobs = jobRepository.findByStatusOrderByCreatedAtDesc("ACTIVE");
        
        return jobs.stream()
                .map(this::convertToListingDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobDetailDTO getJobDetail(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        
        return convertToDetailDTO(job);
    }

    @Override
    @Transactional
    public JobDetailDTO createJob(JobCreateDTO jobDto) {
        Job job = new Job();
        job.setTitle(jobDto.getTitle());
        job.setDescription(jobDto.getDescription());
        job.setRequirements(String.join("|", jobDto.getRequiredSkills()));
        job.setPreferredSkills(String.join("|", jobDto.getPreferredSkills()));
        job.setLocation(jobDto.getLocation());
        job.setJobType(jobDto.getJobType());
        job.setMinYearsExperience(jobDto.getMinYearsExperience());
        job.setSalaryRange(jobDto.getSalaryRange());
        job.setDepartment(jobDto.getDepartment());
        job.setStatus("ACTIVE");
        job.setCreatedAt(LocalDateTime.now());
        
        Job savedJob = jobRepository.save(job);
        
        // Index in Elasticsearch
        IndexQuery indexQuery = new IndexQueryBuilder()
                .withId(savedJob.getId().toString())
                .withObject(savedJob)
                .build();
        
        elasticsearchOperations.index(indexQuery, IndexCoordinates.of("jobs"));
        
        return convertToDetailDTO(savedJob);
    }

    @Override
    @Transactional
    public JobDetailDTO updateJob(Long id, JobCreateDTO jobDto) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        
        job.setTitle(jobDto.getTitle());
        job.setDescription(jobDto.getDescription());
        job.setRequirements(String.join("|", jobDto.getRequiredSkills()));
        job.setPreferredSkills(String.join("|", jobDto.getPreferredSkills()));
        job.setLocation(jobDto.getLocation());
        job.setJobType(jobDto.getJobType());
        job.setMinYearsExperience(jobDto.getMinYearsExperience());
        job.setSalaryRange(jobDto.getSalaryRange());
        job.setDepartment(jobDto.getDepartment());
        job.setUpdatedAt(LocalDateTime.now());
        
        Job updatedJob = jobRepository.save(job);
        
        // Update in Elasticsearch
        IndexQuery indexQuery = new IndexQueryBuilder()
                .withId(updatedJob.getId().toString())
                .withObject(updatedJob)
                .build();
        
        elasticsearchOperations.index(indexQuery, IndexCoordinates.of("jobs"));
        
        return convertToDetailDTO(updatedJob);
    }

    @Override
    @Transactional
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        
        // Soft delete by changing status to DELETED
        job.setStatus("DELETED");
        job.setUpdatedAt(LocalDateTime.now());
        
        jobRepository.save(job);
        
        // Delete from Elasticsearch
        elasticsearchOperations.delete(id.toString(), IndexCoordinates.of("jobs"));
    }

    @Override
    public String generateJobDescription(String title, List<String> requirements) {
        // Call AI service to generate job description
        return aiServiceClient.generateJobDescription(title, requirements);
    }

    @Override
    public List<JobDetailDTO> searchJobs(JobSearchCriteriaDTO criteria) {
        // Create Elasticsearch query
        NativeSearchQueryBuilder searchQueryBuilder = new NativeSearchQueryBuilder();
        
        // Add keyword search if provided
        if (criteria.getKeyword() != null && !criteria.getKeyword().isEmpty()) {
            searchQueryBuilder.withQuery(
                QueryBuilders.multiMatchQuery(criteria.getKeyword(), 
                    "title", "description", "requirements", "preferredSkills")
            );
        }
        
        // Add filters
        if (criteria.getLocations() != null && !criteria.getLocations().isEmpty()) {
            searchQueryBuilder.withFilter(
                QueryBuilders.termsQuery("location", criteria.getLocations())
            );
        }
        
        if (criteria.getJobTypes() != null && !criteria.getJobTypes().isEmpty()) {
            searchQueryBuilder.withFilter(
                QueryBuilders.termsQuery("jobType", criteria.getJobTypes())
            );
        }
        
        if (criteria.getDepartment() != null && !criteria.getDepartment().isEmpty()) {
            searchQueryBuilder.withFilter(
                QueryBuilders.termQuery("department", criteria.getDepartment())
            );
        }
        
        if (criteria.getStatus() != null && !criteria.getStatus().isEmpty()) {
            searchQueryBuilder.withFilter(
                QueryBuilders.termQuery("status", criteria.getStatus())
            );
        }
        
        if (criteria.getMinYearsExperience() != null) {
            searchQueryBuilder.withFilter(
                QueryBuilders.rangeQuery("minYearsExperience")
                    .gte(criteria.getMinYearsExperience())
            );
        }
        
        // Execute search
        Query searchQuery = searchQueryBuilder.build();
        List<Job> searchResults = elasticsearchOperations
            .search(searchQuery, Job.class, IndexCoordinates.of("jobs"))
            .getSearchHits()
            .stream()
            .map(hit -> hit.getContent())
            .collect(Collectors.toList());
        
        // Convert to DTOs
        return searchResults.stream()
            .map(this::convertToDetailDTO)
            .collect(Collectors.toList());
    }

    @Override
    public JobStatsDTO getJobStats() {
        JobStatsDTO stats = new JobStatsDTO();
        
        // Count active and filled jobs
        long activeJobs = jobRepository.countByStatusEquals("ACTIVE");
        long filledJobs = jobRepository.countByStatusEquals("FILLED");
        
        // Count applications
        long totalApplications = jobApplicationRepository.count();
        long newApplications = jobApplicationRepository.countByStatusEquals("APPLIED");
        long inProcessApplications = jobApplicationRepository.countByStatusIn(
            List.of("SCREENING", "INTERVIEW", "OFFER")
        );
        
        // Calculate average time to fill (mock data for now)
        double averageTimeToFill = 25.5; // In days
        
        stats.setActiveJobs((int) activeJobs);
        stats.setFilledJobs((int) filledJobs);
        stats.setTotalApplications((int) totalApplications);
        stats.setNewApplications((int) newApplications);
        stats.setCandidatesInProcess((int) inProcessApplications);
        stats.setAverageTimeToFill(averageTimeToFill);
        
        return stats;
    }

    private JobListingDTO convertToListingDTO(Job job) {
        JobListingDTO dto = new JobListingDTO();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setLocation(job.getLocation());
        dto.setJobType(job.getJobType());
        dto.setSalaryRange(job.getSalaryRange());
        dto.setDepartment(job.getDepartment());
        dto.setStatus(job.getStatus());
        dto.setCreatedAt(job.getCreatedAt());
        
        // Get application count
        long applications = jobApplicationRepository.countByJobId(job.getId());
        dto.setApplications((int) applications);
        
        return dto;
    }

    private JobDetailDTO convertToDetailDTO(Job job) {
        JobDetailDTO dto = new JobDetailDTO();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setRequiredSkills(job.getRequirements() != null ? 
                List.of(job.getRequirements().split("\\|")) : 
                List.of());
        dto.setPreferredSkills(job.getPreferredSkills() != null ? 
                List.of(job.getPreferredSkills().split("\\|")) : 
                List.of());
        dto.setLocation(job.getLocation());
        dto.setJobType(job.getJobType());
        dto.setMinYearsExperience(job.getMinYearsExperience());
        dto.setSalaryRange(job.getSalaryRange());
        dto.setDepartment(job.getDepartment());
        dto.setStatus(job.getStatus());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());
        
        return dto;
    }
}