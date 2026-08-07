package com.codelens.devops.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    // GitHub Stats
    private long totalRepositories;
    private long totalCommits;
    private long activeContributors;
    private String githubStatus;

    // Docker Stats
    private long runningContainers;
    private long stoppedContainers;
    private long totalImages;
    private String dockerStatus;

    // Jenkins Stats
    private long totalJobs;
    private long successfulBuilds;
    private long failedBuilds;
    private double buildSuccessRate;
    private String jenkinsStatus;

    // API Monitor Stats
    private long totalMonitoredApis;
    private long healthyApis;
    private long downApis;
    private double apiUptimePercentage;
    private String apiMonitorStatus;

    // System Health
    private String overallHealth;
    private int healthScore;
}
