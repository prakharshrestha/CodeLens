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
public class GithubService {

    @Value("${github.api-base-url}")
    private String githubApiBaseUrl;

    @Value("${github.token:}")
    private String githubToken;

    @Value("${github.default-username}")
    private String defaultUsername;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/vnd.github.v3+json");
        headers.set("User-Agent", "DevOps-Command-Center");
        if (githubToken != null && !githubToken.isBlank()) {
            headers.set("Authorization", "Bearer " + githubToken);
        }
        return headers;
    }

    private <T> T githubGet(String url, ParameterizedTypeReference<T> type) {
        try {
            HttpEntity<?> entity = new HttpEntity<>(getHeaders());
            ResponseEntity<T> response = restTemplate.exchange(url, HttpMethod.GET, entity, type);
            return response.getBody();
        } catch (Exception e) {
            log.error("GitHub API error for URL {}: {}", url, e.getMessage());
            return null;
        }
    }

    public List<Map<String, Object>> getUserRepos() {
        String url = githubApiBaseUrl + "/users/" + defaultUsername + "/repos?per_page=100&sort=updated";
        List<Map<String, Object>> repos = githubGet(url, new ParameterizedTypeReference<>() {});
        return repos != null ? repos : List.of();
    }

    public Map<String, Object> getRepoDetails(String repoName) {
        String url = githubApiBaseUrl + "/repos/" + defaultUsername + "/" + repoName;
        return githubGet(url, new ParameterizedTypeReference<>() {});
    }

    public List<Map<String, Object>> getRepoCommits(String repoName, int perPage) {
        String url = githubApiBaseUrl + "/repos/" + defaultUsername + "/" + repoName + "/commits?per_page=" + perPage;
        List<Map<String, Object>> commits = githubGet(url, new ParameterizedTypeReference<>() {});
        return commits != null ? commits : List.of();
    }

    public List<Map<String, Object>> getRepoContributors(String repoName) {
        String url = githubApiBaseUrl + "/repos/" + defaultUsername + "/" + repoName + "/contributors?per_page=50";
        List<Map<String, Object>> contributors = githubGet(url, new ParameterizedTypeReference<>() {});
        return contributors != null ? contributors : List.of();
    }

    public Map<String, Object> getRepoLanguages(String repoName) {
        String url = githubApiBaseUrl + "/repos/" + defaultUsername + "/" + repoName + "/languages";
        Map<String, Object> langs = githubGet(url, new ParameterizedTypeReference<>() {});
        return langs != null ? langs : Map.of();
    }

    public List<Map<String, Object>> getRepoBranches(String repoName) {
        String url = githubApiBaseUrl + "/repos/" + defaultUsername + "/" + repoName + "/branches?per_page=100";
        List<Map<String, Object>> branches = githubGet(url, new ParameterizedTypeReference<>() {});
        return branches != null ? branches : List.of();
    }

    public List<Map<String, Object>> getRepoIssues(String repoName, String state) {
        String url = githubApiBaseUrl + "/repos/" + defaultUsername + "/" + repoName + "/issues?state=" + state + "&per_page=50";
        List<Map<String, Object>> issues = githubGet(url, new ParameterizedTypeReference<>() {});
        return issues != null ? issues : List.of();
    }

    public List<Map<String, Object>> getPullRequests(String repoName, String state) {
        String url = githubApiBaseUrl + "/repos/" + defaultUsername + "/" + repoName + "/pulls?state=" + state + "&per_page=50";
        List<Map<String, Object>> prs = githubGet(url, new ParameterizedTypeReference<>() {});
        return prs != null ? prs : List.of();
    }

    public Map<String, Object> getUserProfile() {
        String url = githubApiBaseUrl + "/users/" + defaultUsername;
        return githubGet(url, new ParameterizedTypeReference<>() {});
    }

    public Map<String, Object> getGithubStats() {
        List<Map<String, Object>> repos = getUserRepos();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRepos", repos.size());
        long totalStars = repos.stream()
                .mapToLong(r -> r.get("stargazers_count") instanceof Number ? ((Number) r.get("stargazers_count")).longValue() : 0)
                .sum();
        long totalForks = repos.stream()
                .mapToLong(r -> r.get("forks_count") instanceof Number ? ((Number) r.get("forks_count")).longValue() : 0)
                .sum();
        long openIssues = repos.stream()
                .mapToLong(r -> r.get("open_issues_count") instanceof Number ? ((Number) r.get("open_issues_count")).longValue() : 0)
                .sum();
        stats.put("totalStars", totalStars);
        stats.put("totalForks", totalForks);
        stats.put("totalOpenIssues", openIssues);
        stats.put("username", defaultUsername);
        return stats;
    }

    public String getDefaultUsername() {
        return defaultUsername;
    }
}
