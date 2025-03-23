package com.recruitpme.cvservice.controller;

import com.recruitpme.cvservice.dto.DashboardStatsDTO;
import com.recruitpme.cvservice.dto.RecruitmentSourceDTO;
import com.recruitpme.cvservice.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;


    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats(
            @RequestParam(value = "period", defaultValue = "30days") String period) {

        DashboardStatsDTO stats = dashboardService.getStats(period);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/sources")
    public ResponseEntity<List<RecruitmentSourceDTO>> getRecruitmentSources() {
        List<RecruitmentSourceDTO> sources = dashboardService.getRecruitmentSources();
        return ResponseEntity.ok(sources);
    }
}