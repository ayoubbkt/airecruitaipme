package com.recruitpme.cvservice.controller;

import com.recruitpme.cvservice.dto.CandidateDTO;
import com.recruitpme.cvservice.dto.CandidateNoteDTO;
import com.recruitpme.cvservice.service.CandidateServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateServiceImpl candidateService;


    @GetMapping
    public ResponseEntity<List<CandidateDTO>> getAllCandidates(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false) Integer minScore) {

        List<CandidateDTO> candidates = candidateService.getAllCandidates(status, skills, minScore);
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateDTO> getCandidateById(@PathVariable String id) {
        CandidateDTO candidate = candidateService.getCandidateById(id);
        return ResponseEntity.ok(candidate);
    }

    @GetMapping("/by-job/{jobId}")
    public ResponseEntity<List<CandidateDTO>> getCandidatesByJob(@PathVariable String jobId) {
        List<CandidateDTO> candidates = candidateService.getCandidatesByJob(jobId);
        return ResponseEntity.ok(candidates);
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<CandidateNoteDTO> addCandidateNote(
            @PathVariable String id,
            @RequestBody CandidateNoteDTO noteDto) {

        CandidateNoteDTO savedNote = candidateService.addCandidateNote(id, noteDto);
        return ResponseEntity.ok(savedNote);
    }

    @PutMapping("/{id}/stage")
    public ResponseEntity<CandidateDTO> updateCandidateStage(
            @PathVariable String id,
            @RequestParam String stageId) {

        CandidateDTO updatedCandidate = candidateService.updateCandidateStage(id, stageId);
        return ResponseEntity.ok(updatedCandidate);
    }

    @PostMapping("/{id}/disqualify")
    public ResponseEntity<Void> disqualifyCandidate(@PathVariable String id) {
        candidateService.disqualifyCandidate(id);
        return ResponseEntity.noContent().build();
    }
}