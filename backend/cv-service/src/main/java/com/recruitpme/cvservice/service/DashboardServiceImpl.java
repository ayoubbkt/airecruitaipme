package com.recruitpme.cvservice.service;

import com.recruitpme.cvservice.dto.DashboardStatsDTO;
import com.recruitpme.cvservice.dto.RecruitmentSourceDTO;
import com.recruitpme.cvservice.entity.CVAnalysis;
import com.recruitpme.cvservice.repository.CVAnalysisRepository;
import com.recruitpme.cvservice.repository.CVDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private CVAnalysisRepository cvAnalysisRepository;

    @Autowired
    private CVDocumentRepository cvDocumentRepository;

    @Override
    public DashboardStatsDTO getStats(String period) {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // Calculate period start date
        LocalDateTime startDate;
        LocalDateTime now = LocalDateTime.now();

        switch (period) {
            case "7days":
                startDate = now.minus(7, ChronoUnit.DAYS);
                break;
            case "30days":
                startDate = now.minus(30, ChronoUnit.DAYS);
                break;
            case "90days":
                startDate = now.minus(90, ChronoUnit.DAYS);
                break;
            default:
                startDate = now.minus(30, ChronoUnit.DAYS); // Default to 30 days
        }

        // Get all analyses
        Iterable<CVAnalysis> allAnalyses = cvAnalysisRepository.findAll();
        List<CVAnalysis> analyses = StreamSupport.stream(allAnalyses.spliterator(), false)
                .collect(Collectors.toList());

        // Filter by period if needed
        List<CVAnalysis> periodAnalyses = analyses.stream()
                .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().isAfter(startDate))
                .collect(Collectors.toList());

        // Calculate metrics
        stats.setTotalCandidates(analyses.size());

        // Count recent candidates
        long newCandidatesThisWeek = analyses.stream()
                .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().isAfter(now.minus(7, ChronoUnit.DAYS)))
                .count();
        stats.setNewCandidatesThisWeek((int) newCandidatesThisWeek);

        // Calculate candidates by score
        List<Map<String, Object>> candidatesByScore = new ArrayList<>();

        Map<String, Object> excellent = new HashMap<>();
        excellent.put("label", "Excellent (85+)");
        excellent.put("count", analyses.stream().filter(a -> a.getScore() >= 85).count());
        candidatesByScore.add(excellent);

        Map<String, Object> good = new HashMap<>();
        good.put("label", "Good (70-84)");
        good.put("count", analyses.stream().filter(a -> a.getScore() >= 70 && a.getScore() < 85).count());
        candidatesByScore.add(good);

        Map<String, Object> average = new HashMap<>();
        average.put("label", "Average (50-69)");
        average.put("count", analyses.stream().filter(a -> a.getScore() >= 50 && a.getScore() < 70).count());
        candidatesByScore.add(average);

        Map<String, Object> poor = new HashMap<>();
        poor.put("label", "Poor (<50)");
        poor.put("count", analyses.stream().filter(a -> a.getScore() < 50).count());
        candidatesByScore.add(poor);

        stats.setCandidatesByScore(candidatesByScore);

        // Other metrics would be calculated similarly
        // These are placeholder values
        stats.setTotalJobs(10);
        stats.setActiveJobs(5);
        stats.setInterviewsScheduledThisWeek(8);
        stats.setAverageCandidatesPerJob(12);
        stats.setAverageTimeToHire(21.5); // in days

        // Placeholder for candidates by stage
        List<Map<String, Object>> candidatesByStage = new ArrayList<>();
        Map<String, Object> stage1 = new HashMap<>();
        stage1.put("stage", "Applied");
        stage1.put("count", 45);
        candidatesByStage.add(stage1);

        Map<String, Object> stage2 = new HashMap<>();
        stage2.put("stage", "Screening");
        stage2.put("count", 30);
        candidatesByStage.add(stage2);

        Map<String, Object> stage3 = new HashMap<>();
        stage3.put("stage", "Interview");
        stage3.put("count", 20);
        candidatesByStage.add(stage3);

        Map<String, Object> stage4 = new HashMap<>();
        stage4.put("stage", "Offer");
        stage4.put("count", 5);
        candidatesByStage.add(stage4);

        Map<String, Object> stage5 = new HashMap<>();
        stage5.put("stage", "Hired");
        stage5.put("count", 3);
        candidatesByStage.add(stage5);

        stats.setCandidatesByStage(candidatesByStage);

        // Placeholder for hiring activity
        List<Map<String, Object>> hiringActivity = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            Map<String, Object> month = new HashMap<>();
            month.put("month", String.format("%02d", i + 1));
            month.put("applications", new Random().nextInt(50) + 20);
            month.put("interviews", new Random().nextInt(30) + 10);
            month.put("offers", new Random().nextInt(10) + 2);
            month.put("hires", new Random().nextInt(5) + 1);
            hiringActivity.add(month);
        }
        stats.setHiringActivity(hiringActivity);

        return stats;
    }

    @Override
    public List<RecruitmentSourceDTO> getRecruitmentSources() {
        // This would typically come from your database
        // For now, returning mock data
        List<RecruitmentSourceDTO> sources = new ArrayList<>();

        RecruitmentSourceDTO source1 = new RecruitmentSourceDTO();
        source1.setSource("LinkedIn");
        source1.setCount(45);
        source1.setPercentage(45.0);
        sources.add(source1);

        RecruitmentSourceDTO source2 = new RecruitmentSourceDTO();
        source2.setSource("Job Board");
        source2.setCount(25);
        source2.setPercentage(25.0);
        sources.add(source2);

        RecruitmentSourceDTO source3 = new RecruitmentSourceDTO();
        source3.setSource("Company Website");
        source3.setCount(15);
        source3.setPercentage(15.0);
        sources.add(source3);

        RecruitmentSourceDTO source4 = new RecruitmentSourceDTO();
        source4.setSource("Referrals");
        source4.setCount(10);
        source4.setPercentage(10.0);
        sources.add(source4);

        RecruitmentSourceDTO source5 = new RecruitmentSourceDTO();
        source5.setSource("Other");
        source5.setCount(5);
        source5.setPercentage(5.0);
        sources.add(source5);

        return sources;
    }
}