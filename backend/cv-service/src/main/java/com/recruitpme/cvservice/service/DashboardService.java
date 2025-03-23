package com.recruitpme.cvservice.service;

import com.recruitpme.cvservice.dto.DashboardStatsDTO;
import com.recruitpme.cvservice.dto.RecruitmentSourceDTO;

import java.util.List;

public interface DashboardService {

    DashboardStatsDTO getStats(String period);

    List<RecruitmentSourceDTO> getRecruitmentSources();
}