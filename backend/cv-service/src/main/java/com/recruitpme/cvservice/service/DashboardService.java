package com.recruitpme.cvservice.service;

import com.recruitpme.cvservice.dto.DashboardStatsDTO;


import java.util.List;
import java.util.Map;

public interface DashboardService {
    DashboardStatsDTO getDashboardStats(String period);
    
    List<Map<String, Object>> getRecruitmentSources();
}