package com.recruitpme.interviewservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitpme.interviewservice.client.AIServiceClient;
import com.recruitpme.interviewservice.client.CVServiceClient;
import com.recruitpme.interviewservice.client.JobServiceClient;
import com.recruitpme.interviewservice.dto.*;
import com.recruitpme.interviewservice.entity.Interview;
import com.recruitpme.interviewservice.entity.InterviewFeedback;
import com.recruitpme.interviewservice.exception.ResourceNotFoundException;
import com.recruitpme.interviewservice.repository.InterviewFeedbackRepository;
import com.recruitpme.interviewservice.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;


@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewFeedbackRepository interviewFeedbackRepository;
    private final CVServiceClient cvServiceClient;
    private final JobServiceClient jobServiceClient;
    private final AIServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<InterviewListDTO> getInterviews(String status, LocalDate from, LocalDate to) {
        List<Interview> interviews;
        
        if (status != null && from != null && to != null) {
            interviews = interviewRepository.findByStatusAndScheduledTimeBetween(
                    status, 
                    from.atStartOfDay(), 
                    to.plusDays(1).atStartOfDay()
            );
        } else if (status != null) {
            interviews = interviewRepository.findByStatus(status);
        } else if (from != null && to != null) {
            interviews = interviewRepository.findByScheduledTimeBetween(
                    from.atStartOfDay(), 
                    to.plusDays(1).atStartOfDay()
            );
        } else {
            interviews = interviewRepository.findAll();
        }
        
        return interviews.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewDetailDTO getInterviewDetail(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        
        return convertToDetailDTO(interview);
    }

    @Override
    @Transactional
    public InterviewDetailDTO scheduleInterview(InterviewCreateDTO interviewDto) {
        // Verify candidate exists
        CVDetailDTO candidate = cvServiceClient.getCVDetail(interviewDto.getCandidateId());
        
        // Verify job exists if jobId is provided
        if (interviewDto.getJobId() != null) {
            jobServiceClient.getJobDetail(interviewDto.getJobId());
        }
        
        Interview interview = new Interview();
        interview.setCandidateId(interviewDto.getCandidateId());
        interview.setJobId(interviewDto.getJobId());
        interview.setInterviewType(interviewDto.getInterviewType());
        interview.setScheduledTime(interviewDto.getScheduledTime());
        interview.setDuration(interviewDto.getDuration());
        interview.setLocation(interviewDto.getLocation());
        interview.setInterviewers(String.join(",", interviewDto.getInterviewers()));
        interview.setNotes(interviewDto.getNotes());
        interview.setStatus("SCHEDULED");
        interview.setCreatedAt(LocalDateTime.now());
        
        Interview savedInterview = interviewRepository.save(interview);
        
        // TODO: Send notification to candidate and interviewers
        
        return convertToDetailDTO(savedInterview);
    }

    @Override
    @Transactional
    public InterviewDetailDTO updateInterview(Long id, InterviewCreateDTO interviewDto) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        
        interview.setInterviewType(interviewDto.getInterviewType());
        interview.setScheduledTime(interviewDto.getScheduledTime());
        interview.setDuration(interviewDto.getDuration());
        interview.setLocation(interviewDto.getLocation());
        interview.setInterviewers(String.join(",", interviewDto.getInterviewers()));
        interview.setNotes(interviewDto.getNotes());
        interview.setUpdatedAt(LocalDateTime.now());
        
        Interview updatedInterview = interviewRepository.save(interview);
        
        // TODO: Send notification about updated interview
        
        return convertToDetailDTO(updatedInterview);
    }

    @Override
    @Transactional
    public InterviewDetailDTO cancelInterview(Long id, String reason) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        
        interview.setStatus("CANCELLED");
        interview.setCancellationReason(reason);
        interview.setUpdatedAt(LocalDateTime.now());
        
        Interview cancelledInterview = interviewRepository.save(interview);
        
        // TODO: Send notification about cancelled interview
        
        return convertToDetailDTO(cancelledInterview);
    }

   @Override
    public List<InterviewQuestionDTO> generateInterviewQuestions(Long candidateId, Long jobId) {
        // Get candidate skills and experience
        CVDetailDTO candidate = cvServiceClient.getCVDetail(candidateId.toString()); // Convertir Long en String
        
        // Get job description
        JobDetailDTO job = jobServiceClient.getJobDetail(jobId);
        
        // Create request object
        InterviewQuestionsRequestDTO request = new InterviewQuestionsRequestDTO();
        request.setSkills(candidate.getSkills());
        
        // Convertir la liste d'ExperienceDTO en liste d'Object
        List<Object> experienceObjects = new ArrayList<>(candidate.getExperience());
        request.setExperiences(experienceObjects);
        
        request.setJobDescription(job.getDescription());
        
        // Generate questions using AI service
        return aiServiceClient.generateInterviewQuestions(request);
    }

    private InterviewListDTO convertToListDTO(Interview interview) {
        InterviewListDTO dto = new InterviewListDTO();
        dto.setId(interview.getId());
        dto.setCandidateId(interview.getCandidateId());
        dto.setJobId(interview.getJobId());
        dto.setInterviewType(interview.getInterviewType());
        dto.setScheduledTime(interview.getScheduledTime());
        dto.setDuration(interview.getDuration());
        dto.setStatus(interview.getStatus());
        
        // Get candidate info
        try {
            CVDetailDTO candidate = cvServiceClient.getCVDetail(interview.getCandidateId());
            dto.setCandidateName(candidate.getFirstName() + " " + candidate.getLastName());
        } catch (Exception e) {
            log.error("Error fetching candidate details: {}", e.getMessage());
            dto.setCandidateName("Unknown");
        }
        
        // Get job info if available
        if (interview.getJobId() != null) {
            try {
                JobDetailDTO job = jobServiceClient.getJobDetail(interview.getJobId());
                dto.setJobTitle(job.getTitle());
            } catch (Exception e) {
                log.error("Error fetching job details: {}", e.getMessage());
                dto.setJobTitle("Unknown");
            }
        }
        
        return dto;
    }

    private InterviewDetailDTO convertToDetailDTO(Interview interview) {
        InterviewDetailDTO dto = new InterviewDetailDTO();
        dto.setId(interview.getId());
        dto.setCandidateId(interview.getCandidateId());
        dto.setJobId(interview.getJobId());
        dto.setInterviewType(interview.getInterviewType());
        dto.setScheduledTime(interview.getScheduledTime());
        dto.setDuration(interview.getDuration());
        dto.setLocation(interview.getLocation());
        
        // Convert interviewers from comma-separated string to List
        if (interview.getInterviewers() != null && !interview.getInterviewers().isEmpty()) {
            dto.setInterviewers(List.of(interview.getInterviewers().split(",")));
        } else {
            dto.setInterviewers(List.of());
        }
        
        dto.setNotes(interview.getNotes());
        dto.setStatus(interview.getStatus());
        dto.setCancellationReason(interview.getCancellationReason());
        dto.setCreatedAt(interview.getCreatedAt());
        dto.setUpdatedAt(interview.getUpdatedAt());
        
        // Get candidate info
        try {
            CVDetailDTO candidate = cvServiceClient.getCVDetail(interview.getCandidateId());
            dto.setCandidateName(candidate.getFirstName() + " " + candidate.getLastName());
            dto.setCandidateEmail(candidate.getEmail());
            dto.setCandidatePhone(candidate.getPhone());
        } catch (Exception e) {
            log.error("Error fetching candidate details: {}", e.getMessage());
            dto.setCandidateName("Unknown");
        }
        
        // Get job info if available
        if (interview.getJobId() != null) {
            try {
                JobDetailDTO job = jobServiceClient.getJobDetail(interview.getJobId());
                dto.setJobTitle(job.getTitle());
            } catch (Exception e) {
                log.error("Error fetching job details: {}", e.getMessage());
                dto.setJobTitle("Unknown");
            }
        }
        
        return dto;
    }
    
    @Override
    @Transactional
    public InterviewDetailDTO addFeedback(Long id, InterviewFeedbackDTO feedbackDto) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        
        InterviewFeedback feedback = new InterviewFeedback();
        feedback.setInterview(interview);
        feedback.setInterviewer(feedbackDto.getInterviewer());
        feedback.setTechnicalScore(feedbackDto.getTechnicalScore());
        feedback.setBehavioralScore(feedbackDto.getBehavioralScore());
        feedback.setRecommendation(feedbackDto.getRecommendation());
        feedback.setComments(feedbackDto.getComments());
        
        try {
            feedback.setSkillFeedback(objectMapper.writeValueAsString(feedbackDto.getSkillFeedback()));
        } catch (Exception e) {
            log.error("Error serializing skill feedback: {}", e.getMessage());
            feedback.setSkillFeedback("[]");
        }
        
        feedback.setCreatedAt(LocalDateTime.now());
        
        interviewFeedbackRepository.save(feedback);
        
        // Update interview status if all interviewers have provided feedback
        String[] interviewers = interview.getInterviewers().split(",");
        long feedbackCount = interviewFeedbackRepository.countByInterviewId(id);
        
        if (feedbackCount >= interviewers.length) {
            interview.setStatus("FEEDBACK_COMPLETE");
            interview.setUpdatedAt(LocalDateTime.now());
            interviewRepository.save(interview);
        }
        
        return convertToDetailDTO(interview);
    }

    @Override
    @Transactional
    public InterviewDetailDTO completeInterview(Long id, String outcome) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        
        interview.setStatus("COMPLETED");
        interview.setOutcome(outcome);
        interview.setCompletedAt(LocalDateTime.now());
        interview.setUpdatedAt(LocalDateTime.now());
        
        Interview completedInterview = interviewRepository.save(interview);
        
        // TODO: Notify candidate and hiring manager
        
        return convertToDetailDTO(completedInterview);
    }

    @Override
    public InterviewStatDTO getInterviewStats(String period) {
        LocalDateTime startDate = calculateStartDate(period);
        
        // Calculate stats
        long scheduledCount = interviewRepository.countByStatusAndScheduledTimeAfter("SCHEDULED", startDate);
        long completedCount = interviewRepository.countByStatusAndCompletedAtAfter("COMPLETED", startDate);
        long cancelledCount = interviewRepository.countByStatusAndUpdatedAtAfter("CANCELLED", startDate);
        
        // Get recommendation stats
        long hireRecommendations = interviewFeedbackRepository.countByRecommendationAndCreatedAtAfter("HIRE", startDate);
        long considerRecommendations = interviewFeedbackRepository.countByRecommendationAndCreatedAtAfter("CONSIDER", startDate);
        long rejectRecommendations = interviewFeedbackRepository.countByRecommendationAndCreatedAtAfter("REJECT", startDate);
        
        InterviewStatDTO stats = new InterviewStatDTO();
        stats.setScheduledCount((int) scheduledCount);
        stats.setCompletedCount((int) completedCount);
        stats.setCancelledCount((int) cancelledCount);
        stats.setHireRecommendations((int) hireRecommendations);
        stats.setConsiderRecommendations((int) considerRecommendations);
        stats.setRejectRecommendations((int) rejectRecommendations);
        
        return stats;
    }

    private LocalDateTime calculateStartDate(String period) {
        LocalDateTime now = LocalDateTime.now();
        
        return switch (period) {
            case "7days" -> now.minusDays(7);
            case "14days" -> now.minusDays(14);
            case "30days" -> now.minusDays(30);
            case "90days" -> now.minusDays(90);
            case "6months" -> now.minusMonths(6);
            case "1year" -> now.minusYears(1);
            default -> now.minusDays(30);
        };
    }
}