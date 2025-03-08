package com.recruitpme.jobservice.dto;

import lombok.Data;

@Data
public class JobStatsDTO {
    private int activeJobs;
    private int filledJobs;
    private int totalApplications;
    private int newApplications;
    private int candidatesInProcess;
    private double averageTimeToFill;
}