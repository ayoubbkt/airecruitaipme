package com.recruitpme.cvservice.service;

import com.recruitpme.cvservice.dto.CandidateDTO;
import com.recruitpme.cvservice.dto.CandidateNoteDTO;
import com.recruitpme.cvservice.entity.CVAnalysis;
import com.recruitpme.cvservice.exception.ResourceNotFoundException;
import com.recruitpme.cvservice.repository.CVAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class CandidateServiceImpl {

    @Autowired
    private CVAnalysisRepository cvAnalysisRepository;

    public List<CandidateDTO> getAllCandidates(String status, List<String> skills, Integer minScore) {
        Iterable<CVAnalysis> analyses;

        // Get all analyses
        analyses = cvAnalysisRepository.findAll();

        // Convert to list
        List<CVAnalysis> analysisList = StreamSupport
                .stream(analyses.spliterator(), false)
                .collect(Collectors.toList());

        // Apply filters if needed
        if (minScore != null) {
            analysisList = analysisList.stream()
                    .filter(a -> a.getScore() >= minScore)
                    .collect(Collectors.toList());
        }

        if (skills != null && !skills.isEmpty()) {
            analysisList = analysisList.stream()
                    .filter(a -> a.getSkills() != null && a.getSkills().containsAll(skills))
                    .collect(Collectors.toList());
        }

        // Convert to DTOs
        return analysisList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CandidateDTO getCandidateById(String id) {
        Optional<CVAnalysis> analysisOpt = cvAnalysisRepository.findById(id);

        if (analysisOpt.isPresent()) {
            return convertToDTO(analysisOpt.get());
        } else {
            throw new ResourceNotFoundException("Candidate not found with id: " + id);
        }
    }

    public List<CandidateDTO> getCandidatesByJob(String jobId) {
        List<CVAnalysis> analyses = cvAnalysisRepository.findByJobIdOrderByScoreDesc(jobId);

        return analyses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CandidateNoteDTO addCandidateNote(String candidateId, CandidateNoteDTO noteDto) {
        // Implementation depends on how notes are stored
        // For simplicity, we'll just return the DTO with an ID
        noteDto.setId(UUID.randomUUID().toString());
        noteDto.setCandidateId(candidateId);
        noteDto.setDate(LocalDateTime.now());

        return noteDto;
    }

    public CandidateDTO updateCandidateStage(String id, String stageId) {
        Optional<CVAnalysis> analysisOpt = cvAnalysisRepository.findById(id);

        if (analysisOpt.isPresent()) {
            CVAnalysis analysis = analysisOpt.get();
            // In a real implementation, you would update the stage
            // For now, we just return the existing candidate
            return convertToDTO(analysis);
        } else {
            throw new ResourceNotFoundException("Candidate not found with id: " + id);
        }
    }

    public void disqualifyCandidate(String id) {
        Optional<CVAnalysis> analysisOpt = cvAnalysisRepository.findById(id);

        if (analysisOpt.isPresent()) {
            // Implementation depends on how disqualifications are handled
            // For simplicity, we'll just check if the candidate exists
        } else {
            throw new ResourceNotFoundException("Candidate not found with id: " + id);
        }
    }

    private CandidateDTO convertToDTO(CVAnalysis analysis) {
        CandidateDTO dto = new CandidateDTO();
        dto.setId(analysis.getId());
        dto.setFirstName(analysis.getFirstName());
        dto.setLastName(analysis.getLastName());
        dto.setEmail(analysis.getEmail());
        dto.setPhone(analysis.getPhone());
        dto.setTitle(analysis.getTitle());
        dto.setLocation(analysis.getLocation());
        dto.setSkills(analysis.getSkills());
        dto.setScore(analysis.getScore());
        dto.setYearsOfExperience(analysis.getYearsOfExperience());
        // Status and stage would come from a workflow system
        dto.setStatus("ACTIVE");
        dto.setStage("APPLIED");
        dto.setCreatedAt(analysis.getCreatedAt());
        dto.setUpdatedAt(analysis.getUpdatedAt());
        dto.setNotes(new ArrayList<>());

        return dto;
    }
}