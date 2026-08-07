package com.codelens.devops.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class JenkinsService {

    @Value("${jenkins.base-url}")
    private String jenkinsUrl;

    @Value("${jenkins.username}")
    private String jenkinsUsername;

    @Value("${jenkins.token:}")
    private String jenkinsToken;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (jenkinsUsername != null && !jenkinsToken.isBlank()) {
            String credentials = jenkinsUsername + ":" + jenkinsToken;
            String encoded = Base64.getEncoder().encodeToString(credentials.getBytes());
            headers.set("Authorization", "Basic " + encoded);
        }
        return headers;
    }

    private <T> T jenkinsGet(String path, ParameterizedTypeReference<T> type) {
        try {
            HttpEntity<?> entity = new HttpEntity<>(getHeaders());
            ResponseEntity<T> response = restTemplate.exchange(jenkinsUrl + path, HttpMethod.GET, entity, type);
            return response.getBody();
        } catch (Exception e) {
            log.warn("Jenkins API error for path {}: {}", path, e.getMessage());
            return null;
        }
    }

    public Map<String, Object> getJenkinsInfo() {
        return jenkinsGet("/api/json", new ParameterizedTypeReference<>() {});
    }

    public List<Map<String, Object>> getAllJobs() {
        Map<String, Object> info = jenkinsGet("/api/json?tree=jobs[name,url,color,buildable]", new ParameterizedTypeReference<>() {});
        if (info != null && info.get("jobs") instanceof List<?> jobs) {
            return jobs.stream().filter(j -> j instanceof Map).map(j -> (Map<String, Object>) j).toList();
        }
        return List.of();
    }

    public Map<String, Object> getJobDetails(String jobName) {
        return jenkinsGet("/job/" + jobName + "/api/json", new ParameterizedTypeReference<>() {});
    }

    public Map<String, Object> getJobBuildHistory(String jobName) {
        return jenkinsGet("/job/" + jobName + "/api/json?tree=builds[number,status,result,duration,timestamp,url]", new ParameterizedTypeReference<>() {});
    }

    public Map<String, Object> getBuildDetails(String jobName, int buildNumber) {
        return jenkinsGet("/job/" + jobName + "/" + buildNumber + "/api/json", new ParameterizedTypeReference<>() {});
    }

    public String getBuildLog(String jobName, int buildNumber) {
        try {
            HttpEntity<?> entity = new HttpEntity<>(getHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                jenkinsUrl + "/job/" + jobName + "/" + buildNumber + "/consoleText",
                HttpMethod.GET, entity, String.class);
            return response.getBody() != null ? response.getBody() : "No logs";
        } catch (Exception e) {
            return "Error retrieving log: " + e.getMessage();
        }
    }

    public void triggerBuild(String jobName) {
        try {
            HttpEntity<?> entity = new HttpEntity<>(getHeaders());
            restTemplate.exchange(jenkinsUrl + "/job/" + jobName + "/build", HttpMethod.POST, entity, String.class);
        } catch (Exception e) {
            log.error("Error triggering Jenkins build for job {}: {}", jobName, e.getMessage());
            throw new RuntimeException("Failed to trigger build: " + e.getMessage());
        }
    }

    public void stopBuild(String jobName, int buildNumber) {
        try {
            HttpEntity<?> entity = new HttpEntity<>(getHeaders());
            restTemplate.exchange(jenkinsUrl + "/job/" + jobName + "/" + buildNumber + "/stop", HttpMethod.POST, entity, String.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to stop build: " + e.getMessage());
        }
    }

    public Map<String, Object> getJenkinsStats() {
        List<Map<String, Object>> jobs = getAllJobs();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", jobs.size());
        long successfulJobs = jobs.stream()
                .filter(j -> "blue".equals(j.get("color")) || "blue_anime".equals(j.get("color")))
                .count();
        long failedJobs = jobs.stream()
                .filter(j -> "red".equals(j.get("color")) || "red_anime".equals(j.get("color")))
                .count();
        stats.put("successfulJobs", successfulJobs);
        stats.put("failedJobs", failedJobs);
        stats.put("successRate", jobs.isEmpty() ? 0 : (double) successfulJobs / jobs.size() * 100);
        return stats;
    }

    public boolean isJenkinsAvailable() {
        try {
            return getJenkinsInfo() != null;
        } catch (Exception e) {
            return false;
        }
    }
}
