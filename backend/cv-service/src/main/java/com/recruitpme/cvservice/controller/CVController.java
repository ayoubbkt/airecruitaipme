package com.recruitpme.cvservice.controller;

import com.recruitpme.cvservice.dto.*;
import com.recruitpme.cvservice.service.CVAnalysisService;
import com.recruitpme.cvservice.service.CVStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/cv")
public class CVController {

    @Autowired
    private CVStorageService cvStorageService;


    @Autowired
    private CVAnalysisService cvAnalysisService;

    @PostMapping("/upload")
    public ResponseEntity<CVUploadResponseDTO> uploadCV(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "jobId", required = false) String jobId) {

        List<String> uploadedFileIds = cvStorageService.storeFiles(files);
        CVUploadResponseDTO response = new CVUploadResponseDTO();
        response.setFileIds(uploadedFileIds);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalysisRequestDTO> analyzeCV(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("jobId") String jobId) {

        String analysisId = cvAnalysisService.submitBatchAnalysis(files, jobId);
        AnalysisRequestDTO response = new AnalysisRequestDTO();
        response.setAnalysisId(analysisId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze-single")
    public ResponseEntity<CVAnalysisResponseDTO> analyzeSingleCV(
            @RequestBody CVAnalysisRequestDTO request) {

        CVAnalysisResponseDTO analysis = cvAnalysisService.analyzeSingleCV(request.getCvId(), request.getJobId());
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/analyze/progress/{analysisId}")
    public ResponseEntity<AnalysisProgressDTO> getAnalysisProgress(
            @PathVariable String analysisId) {

        AnalysisProgressDTO progress = cvAnalysisService.getAnalysisProgress(analysisId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CVDetailResponseDTO> getCVDetails(@PathVariable String id) {
        CVDetailResponseDTO cvDetails = cvAnalysisService.getCVDetails(id);
        return ResponseEntity.ok(cvDetails);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadCV(@PathVariable String id) {
        Resource file = cvStorageService.loadFileAsResource(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewCV(@PathVariable String id) {
        Resource file = cvStorageService.loadFileAsResource(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }
}