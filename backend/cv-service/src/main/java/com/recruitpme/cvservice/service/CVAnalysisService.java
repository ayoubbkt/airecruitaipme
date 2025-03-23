package com.recruitpme.cvservice.service;

import com.recruitpme.cvservice.client.AIServiceClient;
import com.recruitpme.cvservice.client.JobServiceClient;
import com.recruitpme.cvservice.dto.*;
import com.recruitpme.cvservice.entity.CVAnalysis;
import com.recruitpme.cvservice.entity.CVDocument;
import com.recruitpme.cvservice.exception.FileStorageException;
import com.recruitpme.cvservice.exception.ResourceNotFoundException;
import com.recruitpme.cvservice.repository.CVAnalysisRepository;
import com.recruitpme.cvservice.repository.CVDocumentRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CVAnalysisService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private CVDocumentRepository cvDocumentRepository;

    @Autowired
    private CVAnalysisRepository cvAnalysisRepository;

    @Autowired
    private CVStorageService cvStorageService;

    @Autowired
    private AIServiceClient aiServiceClient;

    @Autowired
    private JobServiceClient jobServiceClient;

    // Cache for analysis progress
    private final Map<String, AnalysisProgressDTO> analysisProgressCache = new ConcurrentHashMap<>();

    public String submitBatchAnalysis(MultipartFile[] files, String jobId) {
        // Generate analysis ID
        String analysisId = UUID.randomUUID().toString();

        // Store files
        List<String> fileIds = cvStorageService.storeFiles(files);

        // Initialize progress
        AnalysisProgressDTO progress = new AnalysisProgressDTO();
        progress.setAnalysisId(analysisId);
        progress.setProgress(0);
        progress.setCompleted(false);
        progress.setResults(new ArrayList<>());

        // Cache progress
        analysisProgressCache.put(analysisId, progress);

        // Submit analysis jobs in background
        Thread analysisThread = new Thread(() -> processAnalysisBatch(analysisId, fileIds, jobId));
        analysisThread.start();

        return analysisId;
    }

    private void processAnalysisBatch(String analysisId, List<String> fileIds, String jobId) {
        AnalysisProgressDTO progress = analysisProgressCache.get(analysisId);

        if (progress == null) {
            return;
        }

        int totalFiles = fileIds.size();
        int processedFiles = 0;
        List<CVAnalysisResponseDTO> results = new ArrayList<>();

        for (String fileId : fileIds) {
            try {
                // Analyze CV
                CVAnalysisResponseDTO result = analyzeSingleCV(fileId, jobId);
                results.add(result);

                // Update progress
                processedFiles++;
                int percentage = (processedFiles * 100) / totalFiles;
                progress.setProgress(percentage);
                progress.setResults(results);
                analysisProgressCache.put(analysisId, progress);

            } catch (Exception e) {
                log.error("Error analyzing CV {}: {}", fileId, e.getMessage(), e);
            }
        }

        // Compute statistics
        AnalysisStatsDTO stats = computeAnalysisStats(results);
        progress.setStats(stats);

        // Mark as completed
        progress.setCompleted(true);
        analysisProgressCache.put(analysisId, progress);
    }

    private AnalysisStatsDTO computeAnalysisStats(List<CVAnalysisResponseDTO> results) {
        AnalysisStatsDTO stats = new AnalysisStatsDTO();

        // Count unique skills
        Set<String> allSkills = new HashSet<>();
        results.forEach(result -> {
            if (result.getSkills() != null) {
                allSkills.addAll(result.getSkills());
            }
        });
        stats.setSkillsDetected(allSkills.size());

        // Count recommended candidates (score >= 85)
        long recommendedCount = results.stream()
                .filter(result -> result.getScore() >= 85)
                .count();
        stats.setRecommendedCandidates((int) recommendedCount);

        // Find top candidate
        Optional<CVAnalysisResponseDTO> topCandidate = results.stream()
                .max(Comparator.comparing(CVAnalysisResponseDTO::getScore));

        if (topCandidate.isPresent()) {
            CVAnalysisResponseDTO top = topCandidate.get();
            stats.setTopCandidateName(top.getFirstName() + " " + top.getLastName());
            stats.setTopCandidateScore(top.getScore());
        }

        return stats;
    }

    public AnalysisProgressDTO getAnalysisProgress(String analysisId) {
        AnalysisProgressDTO progress = analysisProgressCache.get(analysisId);

        if (progress == null) {
            throw new ResourceNotFoundException("Analysis not found with id: " + analysisId);
        }

        return progress;
    }

    public CVAnalysisResponseDTO analyzeSingleCV(String cvId, String jobId) {
        try {
            // Check if CV exists
            CVDocument cvDocument = cvDocumentRepository.findById(cvId)
                    .orElseThrow(() -> new ResourceNotFoundException("CV not found with id: " + cvId));

            // Extract text from CV if not already extracted
            String extractedText = cvDocument.getExtractedText();
            if (extractedText == null || extractedText.isEmpty()) {
                extractedText = extractTextFromFile(cvId);
                cvDocument.setExtractedText(extractedText);
                cvDocumentRepository.save(cvDocument);
            }

            // Call AI service to analyze the CV
            AnalysisResultDTO analysisResult = aiServiceClient.analyzeCv(extractedText, jobId);

            // Save analysis result
            saveAnalysisResult(analysisResult, cvId, jobId);

            // Convert to response DTO
            return convertToAnalysisResponseDTO(analysisResult, cvId);

        } catch (Exception e) {
            log.error("Error analyzing CV {}: {}", cvId, e.getMessage(), e);
            throw new FileStorageException("Failed to analyze CV: " + e.getMessage(), e);
        }
    }

    private String extractTextFromFile(String fileId) {
        try {
            // Get file from MinIO
            GetObjectArgs getObjectArgs = GetObjectArgs.builder()
                    .bucket("cvs")
                    .object(fileId)
                    .build();

            // Read text content
            StringBuilder textContent = new StringBuilder();
            BufferedReader reader = new BufferedReader(new InputStreamReader(minioClient.getObject(getObjectArgs)));
            String line;
            while ((line = reader.readLine()) != null) {
                textContent.append(line).append("\n");
            }

            return textContent.toString();

        } catch (Exception e) {
            log.error("Error extracting text from file {}: {}", fileId, e.getMessage(), e);
            throw new FileStorageException("Failed to extract text from file: " + e.getMessage(), e);
        }
    }

    private void saveAnalysisResult(AnalysisResultDTO analysisResult, String cvId, String jobId) {
        // Check if analysis already exists
        Optional<CVAnalysis> existingAnalysis = cvAnalysisRepository.findByCvIdAndJobId(cvId, jobId);

        CVAnalysis analysis;
        if (existingAnalysis.isPresent()) {
            analysis = existingAnalysis.get();
        } else {
            analysis = new CVAnalysis();
            analysis.setId(UUID.randomUUID().toString());
            analysis.setCvId(cvId);
            analysis.setJobId(jobId);
            analysis.setCreatedAt(LocalDateTime.now());
        }

        // Update analysis fields
        analysis.setScore(analysisResult.getScore());
        analysis.setFirstName(analysisResult.getFirstName());
        analysis.setLastName(analysisResult.getLastName());
        analysis.setEmail(analysisResult.getEmail());
        analysis.setPhone(analysisResult.getPhone());
        analysis.setTitle(analysisResult.getTitle());
        analysis.setLocation(analysisResult.getLocation());
        analysis.setYearsOfExperience(analysisResult.getYearsOfExperience());
        analysis.setSkills(analysisResult.getSkills());
        analysis.setRequiredSkillsMatch(analysisResult.getRequiredSkillsMatch());
        analysis.setRequiredSkillsTotal(analysisResult.getRequiredSkillsTotal());
        analysis.setPreferredSkillsMatch(analysisResult.getPreferredSkillsMatch());
        analysis.setPreferredSkillsTotal(analysisResult.getPreferredSkillsTotal());
        analysis.setUpdatedAt(LocalDateTime.now());

        // Save to repository
        cvAnalysisRepository.save(analysis);
    }

    private CVAnalysisResponseDTO convertToAnalysisResponseDTO(AnalysisResultDTO analysisResult, String cvId) {
        CVAnalysisResponseDTO responseDTO = new CVAnalysisResponseDTO();
        responseDTO.setId(cvId);
        responseDTO.setFirstName(analysisResult.getFirstName());
        responseDTO.setLastName(analysisResult.getLastName());
        responseDTO.setEmail(analysisResult.getEmail());
        responseDTO.setPhone(analysisResult.getPhone());
        responseDTO.setTitle(analysisResult.getTitle());
        responseDTO.setScore(analysisResult.getScore());
        responseDTO.setYearsOfExperience(analysisResult.getYearsOfExperience());
        responseDTO.setSkills(analysisResult.getSkills());
        responseDTO.setRequiredSkillsMatch(analysisResult.getRequiredSkillsMatch());
        responseDTO.setRequiredSkillsTotal(analysisResult.getRequiredSkillsTotal());
        responseDTO.setPreferredSkillsMatch(analysisResult.getPreferredSkillsMatch());
        responseDTO.setPreferredSkillsTotal(analysisResult.getPreferredSkillsTotal());

        return responseDTO;
    }

    public CVDetailResponseDTO getCVDetails(String id) {
        // Get CV document
        CVDocument cvDocument = cvDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CV not found with id: " + id));

        // Get analysis if available
        List<CVAnalysis> analyses = cvAnalysisRepository.findByCvId(id);
        CVAnalysis analysis = analyses.isEmpty() ? null : analyses.get(0);

        // Build response
        CVDetailResponseDTO responseDTO = new CVDetailResponseDTO();
        responseDTO.setId(id);

        if (analysis != null) {
            responseDTO.setFirstName(analysis.getFirstName());
            responseDTO.setLastName(analysis.getLastName());
            responseDTO.setEmail(analysis.getEmail());
            responseDTO.setPhone(analysis.getPhone());
            responseDTO.setTitle(analysis.getTitle());
            responseDTO.setLocation(analysis.getLocation());
            responseDTO.setScore(analysis.getScore());
            responseDTO.setYearsOfExperience(analysis.getYearsOfExperience());
            responseDTO.setSkills(analysis.getSkills());
            responseDTO.setCreatedAt(analysis.getCreatedAt());
            responseDTO.setUpdatedAt(analysis.getUpdatedAt());

            // Add analysis details if available
            if (analysis.getRequiredSkillsAnalysis() != null) {
                List<SkillAnalysisDTO> requiredSkills = convertSkillAnalysis(analysis.getRequiredSkillsAnalysis());
                responseDTO.setRequiredSkillsAnalysis(requiredSkills);
            }

            if (analysis.getPreferredSkillsAnalysis() != null) {
                List<SkillAnalysisDTO> preferredSkills = convertSkillAnalysis(analysis.getPreferredSkillsAnalysis());
                responseDTO.setPreferredSkillsAnalysis(preferredSkills);
            }

            responseDTO.setRequiredSkillsMatch(analysis.getRequiredSkillsMatch());
            responseDTO.setRequiredSkillsTotal(analysis.getRequiredSkillsTotal());
            responseDTO.setPreferredSkillsMatch(analysis.getPreferredSkillsMatch());
            responseDTO.setPreferredSkillsTotal(analysis.getPreferredSkillsTotal());
            responseDTO.setExperienceInsights(analysis.getExperienceInsights());
            responseDTO.setEducationInsights(analysis.getEducationInsights());
            responseDTO.setStrengths(analysis.getStrengths());
            responseDTO.setAreasForImprovement(analysis.getAreasForImprovement());
            responseDTO.setJobFitAnalysis(analysis.getJobFitAnalysis());
            responseDTO.setCategoryScores(analysis.getCategoryScores());

            // Convert experience and education
            if (analysis.getExperience() != null) {
                List<ExperienceDTO> experience = convertExperience(analysis.getExperience());
                responseDTO.setExperience(experience);
            }

            if (analysis.getEducation() != null) {
                List<EducationDTO> education = convertEducation(analysis.getEducation());
                responseDTO.setEducation(education);
            }

            // Convert interview questions
            if (analysis.getInterviewQuestions() != null) {
                List<InterviewQuestionDTO> questions = convertInterviewQuestions(analysis.getInterviewQuestions());
                responseDTO.setInterviewQuestions(questions);
            }
        }

        // Set empty lists for null fields
        if (responseDTO.getSkills() == null) {
            responseDTO.setSkills(new ArrayList<>());
        }

        if (responseDTO.getExperience() == null) {
            responseDTO.setExperience(new ArrayList<>());
        }

        if (responseDTO.getEducation() == null) {
            responseDTO.setEducation(new ArrayList<>());
        }

        if (responseDTO.getNotes() == null) {
            responseDTO.setNotes(new ArrayList<>());
        }

        return responseDTO;
    }

    private List<SkillAnalysisDTO> convertSkillAnalysis(List<Map<String, Object>> skillAnalysis) {
        return skillAnalysis.stream()
                .map(map -> {
                    SkillAnalysisDTO dto = new SkillAnalysisDTO();
                    dto.setName((String) map.get("name"));
                    dto.setMatched((Boolean) map.get("matched"));
                    if (map.get("confidence") instanceof Integer) {
                        dto.setConfidence((Integer) map.get("confidence"));
                    } else if (map.get("confidence") instanceof Double) {
                        dto.setConfidence(((Double) map.get("confidence")).intValue());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<ExperienceDTO> convertExperience(List<Map<String, Object>> experience) {
        return experience.stream()
                .map(map -> {
                    ExperienceDTO dto = new ExperienceDTO();
                    dto.setTitle((String) map.get("title"));
                    dto.setCompany((String) map.get("company"));
                    dto.setLocation((String) map.get("location"));
                    dto.setStartDate((String) map.get("startDate"));
                    dto.setEndDate((String) map.get("endDate"));
                    dto.setPeriod((String) map.get("period"));
                    dto.setDescription((String) map.get("description"));
                    if (map.get("currentPosition") instanceof Boolean) {
                        dto.setCurrentPosition((Boolean) map.get("currentPosition"));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<EducationDTO> convertEducation(List<Map<String, Object>> education) {
        return education.stream()
                .map(map -> {
                    EducationDTO dto = new EducationDTO();
                    dto.setDegree((String) map.get("degree"));
                    dto.setInstitution((String) map.get("institution"));
                    dto.setLocation((String) map.get("location"));
                    dto.setField((String) map.get("field"));
                    dto.setStartYear((String) map.get("startYear"));
                    dto.setEndYear((String) map.get("endYear"));
                    dto.setPeriod((String) map.get("period"));
                    dto.setDescription((String) map.get("description"));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<InterviewQuestionDTO> convertInterviewQuestions(List<Map<String, Object>> questions) {
        return questions.stream()
                .map(map -> {
                    InterviewQuestionDTO dto = new InterviewQuestionDTO();
                    dto.setQuestion((String) map.get("question"));
                    dto.setRationale((String) map.get("rationale"));
                    dto.setCategory((String) map.get("category"));
                    return dto;
                })
                .collect(Collectors.toList());
    }
}