package com.recruitpme.cvservice.service;

import com.recruitpme.cvservice.dto.DashboardStatsDTO;
import com.recruitpme.cvservice.entity.CVDocument;
import com.recruitpme.cvservice.repository.CVAnalysisRepository;
import com.recruitpme.cvservice.repository.CVDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final CVDocumentRepository cvDocumentRepository;
    private final CVAnalysisRepository cvAnalysisRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats(String period) {
        LocalDateTime startDate = calculateStartDate(period);
        
        // Get counts for each metric
        long analyzedCVs = cvDocumentRepository.countByUploadedAtAfter(startDate);
        
        // For previous period
        LocalDateTime previousPeriodStart = getStartDateForPreviousPeriod(period, startDate);
        long previousAnalyzedCVs = cvDocumentRepository.countByUploadedAtBetween(
                previousPeriodStart, startDate);
        
        // Calculate percentage changes
        int analyzedCVsPercentChange = calculatePercentChange(analyzedCVs, previousAnalyzedCVs);
        
        // Qualified candidates (score >= 80)
        long qualifiedCandidates = cvAnalysisRepository.countByScoreGreaterThanEqualAndCreatedAtAfter(80, startDate);
        long previousQualifiedCandidates = cvAnalysisRepository.countByScoreGreaterThanEqualAndCreatedAtBetween(
                80, previousPeriodStart, startDate);
        int qualifiedCandidatesPercentChange = calculatePercentChange(qualifiedCandidates, previousQualifiedCandidates);
        
        // Mocked data for demonstration
        int scheduledInterviews = 15;
        int scheduledInterviewsPercentChange = 25;
        int timeToHire = 21;
        int timeToHireChange = -2;
        
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setAnalyzedCVs((int) analyzedCVs);
        stats.setAnalyzedCVsPercentChange(analyzedCVsPercentChange);
        stats.setQualifiedCandidates((int) qualifiedCandidates);
        stats.setQualifiedCandidatesPercentChange(qualifiedCandidatesPercentChange);
        stats.setScheduledInterviews(scheduledInterviews);
        stats.setScheduledInterviewsPercentChange(scheduledInterviewsPercentChange);
        stats.setTimeToHire(timeToHire);
        stats.setTimeToHireChange(timeToHireChange);
        
        return stats;
    }

    @Override
    public List<Map<String, Object>> getRecruitmentSources() {
        // Mock data for recruitment sources
        List<Map<String, Object>> sources = new ArrayList<>();
        
        sources.add(createSourceData("LinkedIn", 45, "#4A6FDC"));
        sources.add(createSourceData("Indeed", 25, "#2164F3"));
        sources.add(createSourceData("Website", 15, "#12B7B3"));
        sources.add(createSourceData("Referrals", 10, "#7A56CF"));
        sources.add(createSourceData("Other", 5, "#F8C12C"));
        
        return sources;
    }
    
    private Map<String, Object> createSourceData(String name, int percentage, String color) {
        Map<String, Object> source = new HashMap<>();
        source.put("id", UUID.randomUUID().toString());
        source.put("name", name);
        source.put("percentage", percentage);
        source.put("color", color);
        return source;
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
    
    private LocalDateTime getStartDateForPreviousPeriod(String period, LocalDateTime currentPeriodStart) {
        LocalDateTime now = LocalDateTime.now();
        
        return switch (period) {
            case "7days" -> currentPeriodStart.minusDays(7);
            case "14days" -> currentPeriodStart.minusDays(14);
            case "30days" -> currentPeriodStart.minusDays(30);
            case "90days" -> currentPeriodStart.minusDays(90);
            case "6months" -> currentPeriodStart.minusMonths(6);
            case "1year" -> currentPeriodStart.minusYears(1);
            default -> currentPeriodStart.minusDays(30);
        };
    }
    
    private int calculatePercentChange(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100 : 0;
        }
        
        return (int) ((current - previous) * 100 / previous);
    }
}