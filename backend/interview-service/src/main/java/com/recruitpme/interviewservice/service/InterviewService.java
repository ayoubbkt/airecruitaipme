package com.recruitpme.interviewservice.service;

import com.recruitpme.interviewservice.dto.*;

import java.time.LocalDate;
import java.util.List;


public interface InterviewService {
    List<InterviewListDTO> getInterviews(String status, LocalDate from, LocalDate to);
    
    InterviewDetailDTO getInterviewDetail(Long id);
    
    InterviewDetailDTO scheduleInterview(InterviewCreateDTO interviewDto);
    
    InterviewDetailDTO updateInterview(Long id, InterviewCreateDTO interviewDto);
    
    InterviewDetailDTO cancelInterview(Long id, String reason);
    
    InterviewDetailDTO addFeedback(Long id, InterviewFeedbackDTO feedbackDto);
    
    InterviewDetailDTO completeInterview(Long id, String outcome);
    
    List<InterviewQuestionDTO> generateInterviewQuestions(Long candidateId, Long jobId);
    
    InterviewStatDTO getInterviewStats(String period);
}