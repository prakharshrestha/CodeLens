package com.codelens.devops.controller;

import com.codelens.devops.dto.ApiResponse;
import com.codelens.devops.dto.dashboard.DashboardStatsDto;
import com.codelens.devops.entity.Alert;
import com.codelens.devops.repository.AlertRepository;
import com.codelens.devops.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final GithubService githubService;
    private final DockerService dockerService;
    private final JenkinsService jenkinsService;
    private final ApiMonitorService apiMonitorService;
    private final AlertRepository alertRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        Map<String, Object> githubStats = githubService.getGithubStats();
        Map<String, Object> dockerStats = dockerService.getDockerStats();
        Map<String, Object> jenkinsStats = jenkinsService.getJenkinsStats();
        Map<String, Long> apiStats = apiMonitorService.getApiStats();

        long totalRepos = githubStats.get("totalRepos") instanceof Number n ? n.longValue() : 0;
        long runningContainers = dockerStats.get("runningContainers") instanceof Number n ? n.longValue() : 0;
        long stoppedContainers = dockerStats.get("stoppedContainers") instanceof Number n ? n.longValue() : 0;
        long totalImages = dockerStats.get("totalImages") instanceof Number n ? n.longValue() : 0;
        long totalJobs = jenkinsStats.get("totalJobs") instanceof Number n ? n.longValue() : 0;
        long successfulJobs = jenkinsStats.get("successfulJobs") instanceof Number n ? n.longValue() : 0;
        long failedJobs = jenkinsStats.get("failedJobs") instanceof Number n ? n.longValue() : 0;
        double successRate = jenkinsStats.get("successRate") instanceof Number n ? n.doubleValue() : 0;

        long totalApis = apiStats.getOrDefault("total", 0L);
        long healthyApis = apiStats.getOrDefault("healthy", 0L);
        long downApis = apiStats.getOrDefault("down", 0L);

        // Calculate overall health score
        int healthScore = calculateHealthScore(runningContainers, stoppedContainers, healthyApis, downApis, successRate);
        String overallHealth = healthScore >= 80 ? "HEALTHY" : healthScore >= 50 ? "DEGRADED" : "CRITICAL";

        DashboardStatsDto stats = DashboardStatsDto.builder()
                .totalRepositories(totalRepos)
                .totalCommits(0L)  // Would require DB caching
                .activeContributors(0L)
                .githubStatus(githubService.getGithubStats().isEmpty() ? "DISCONNECTED" : "CONNECTED")
                .runningContainers(runningContainers)
                .stoppedContainers(stoppedContainers)
                .totalImages(totalImages)
                .dockerStatus(dockerService.isDockerAvailable() ? "CONNECTED" : "DISCONNECTED")
                .totalJobs(totalJobs)
                .successfulBuilds(successfulJobs)
                .failedBuilds(failedJobs)
                .buildSuccessRate(successRate)
                .jenkinsStatus(jenkinsService.isJenkinsAvailable() ? "CONNECTED" : "DISCONNECTED")
                .totalMonitoredApis(totalApis)
                .healthyApis(healthyApis)
                .downApis(downApis)
                .apiUptimePercentage(totalApis > 0 ? (double) healthyApis / totalApis * 100 : 0)
                .apiMonitorStatus("ACTIVE")
                .overallHealth(overallHealth)
                .healthScore(healthScore)
                .build();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<List<Alert>>> getRecentAlerts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(alertRepository.findByOrderByCreatedAtDesc(PageRequest.of(0, limit))));
    }

    @GetMapping("/alerts/unread")
    public ResponseEntity<ApiResponse<List<Alert>>> getUnreadAlerts() {
        return ResponseEntity.ok(ApiResponse.success(alertRepository.findByReadFalseOrderByCreatedAtDesc()));
    }

    @PutMapping("/alerts/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAlertRead(@PathVariable Long id) {
        alertRepository.findById(id).ifPresent(a -> { a.setRead(true); alertRepository.save(a); });
        return ResponseEntity.ok(ApiResponse.success("Alert marked as read", null));
    }

    private int calculateHealthScore(long running, long stopped, long healthy, long down, double buildRate) {
        int score = 100;
        if (running + stopped > 0) {
            double containerRatio = running > 0 ? (double) running / (running + stopped) : 0;
            score = (int)(score * 0.4 * containerRatio + score * 0.6);
        }
        if (healthy + down > 0) {
            double apiRatio = (double) healthy / (healthy + down);
            score = (int)(score * 0.5 * apiRatio + score * 0.5);
        }
        score = (int)(score * 0.7 + buildRate * 0.3);
        return Math.max(0, Math.min(100, score));
    }
}
