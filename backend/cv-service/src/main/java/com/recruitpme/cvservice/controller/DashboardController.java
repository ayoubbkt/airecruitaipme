package com.recruitpme.cvservice.controller;

import com.recruitpme.cvservice.dto.DashboardStatsDTO;
import com.recruitpme.cvservice.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(
            @RequestParam(value = "period", defaultValue = "30days") String period) {
        
        log.info("Fetching dashboard stats for period: {}", period);
        DashboardStatsDTO stats = dashboardService.getDashboardStats(period);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/sources")
    public ResponseEntity<List<Map<String, Object>>> getRecruitmentSources() {
        log.info("Fetching recruitment sources data");
        List<Map<String, Object>> sources = dashboardService.getRecruitmentSources();
        return ResponseEntity.ok(sources);
    }
}