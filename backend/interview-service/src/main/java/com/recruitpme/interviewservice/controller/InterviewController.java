package com.recruitpme.interviewservice.controller;

import com.recruitpme.interviewservice.dto.*;
import com.recruitpme.interviewservice.service.InterviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Slf4j
public class InterviewController {


    private final InterviewService interviewService;

    @GetMapping
    public ResponseEntity<List<InterviewListDTO>> getInterviews(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        
        log.info("Fetching interviews with status: {}, from: {}, to: {}", status, from, to);
        List<InterviewListDTO> interviews = interviewService.getInterviews(status, from, to);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewDetailDTO> getInterviewDetail(@PathVariable Long id) {
        log.info("Fetching interview details for ID: {}", id);
        InterviewDetailDTO interview = interviewService.getInterviewDetail(id);
        return ResponseEntity.ok(interview);
    }

    @PostMapping
    public ResponseEntity<InterviewDetailDTO> scheduleInterview(@Valid @RequestBody InterviewCreateDTO interviewDto) {
        log.info("Scheduling interview for candidate ID: {}", interviewDto.getCandidateId());
        InterviewDetailDTO createdInterview = interviewService.scheduleInterview(interviewDto);
        return ResponseEntity.ok(createdInterview);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterviewDetailDTO> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody InterviewCreateDTO interviewDto) {
        
        log.info("Updating interview with ID: {}", id);
        InterviewDetailDTO updatedInterview = interviewService.updateInterview(id, interviewDto);
        return ResponseEntity.ok(updatedInterview);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<InterviewDetailDTO> cancelInterview(
            @PathVariable Long id,
            @RequestBody Map<String, String> cancelRequest) {
        
        String reason = cancelRequest.get("reason");
        log.info("Cancelling interview with ID: {}, reason: {}", id, reason);
        InterviewDetailDTO cancelledInterview = interviewService.cancelInterview(id, reason);
        return ResponseEntity.ok(cancelledInterview);
    }

    @GetMapping("/stats")
    public ResponseEntity<InterviewStatDTO> getInterviewStats(
            @RequestParam(value = "period", defaultValue = "30days") String period) {
        
        log.info("Fetching interview stats for period: {}", period);
        InterviewStatDTO stats = interviewService.getInterviewStats(period);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<InterviewDetailDTO> addFeedback(
            @PathVariable Long id,
            @Valid @RequestBody InterviewFeedbackDTO feedbackDto) {
        
        log.info("Adding feedback for interview with ID: {}", id);
        InterviewDetailDTO updatedInterview = interviewService.addFeedback(id, feedbackDto);
        return ResponseEntity.ok(updatedInterview);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<InterviewDetailDTO> completeInterview(
            @PathVariable Long id,
            @RequestBody Map<String, String> completeRequest) {
        
        String outcome = completeRequest.get("outcome");
        log.info("Completing interview with ID: {}, outcome: {}", id, outcome);
        InterviewDetailDTO completedInterview = interviewService.completeInterview(id, outcome);
        return ResponseEntity.ok(completedInterview);
    }

    @PostMapping("/generate-questions")
    public ResponseEntity<List<InterviewQuestionDTO>> generateInterviewQuestions(
            @RequestParam Long candidateId,
            @RequestParam Long jobId) {
        
        log.info("Generating interview questions for candidate ID: {} and job ID: {}", candidateId, jobId);
        List<InterviewQuestionDTO> questions = interviewService.generateInterviewQuestions(candidateId, jobId);
        return ResponseEntity.ok(questions);
    }
}