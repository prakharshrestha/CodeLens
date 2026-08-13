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

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders getHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/vnd.github.v3+json");
        headers.set("User-Agent", "DevOps-Command-Center");
        if (token != null && !token.isBlank()) {
            headers.set("Authorization", "Bearer " + token);
        }
        return headers;
    }

    private <T> T githubGet(String url, String token, ParameterizedTypeReference<T> type) {
        try {
            HttpEntity<?> entity = new HttpEntity<>(getHeaders(token));
            ResponseEntity<T> response = restTemplate.exchange(url, HttpMethod.GET, entity, type);
            return response.getBody();
        } catch (Exception e) {
            log.error("GitHub API error for URL {}: {}", url, e.getMessage());
            return null;
        }
    }

    public List<Map<String, Object>> getUserRepos(String username, String token) {
        if (username == null || username.isBlank()) return List.of();
        String url = githubApiBaseUrl + "/users/" + username + "/repos?per_page=100&sort=updated";
        List<Map<String, Object>> repos = githubGet(url, token, new ParameterizedTypeReference<>() {});
        return repos != null ? repos : List.of();
    }

    public Map<String, Object> getRepoDetails(String username, String token, String repoName) {
        if (username == null || username.isBlank()) return Map.of();
        String url = githubApiBaseUrl + "/repos/" + username + "/" + repoName;
        return githubGet(url, token, new ParameterizedTypeReference<>() {});
    }

    public List<Map<String, Object>> getRepoCommits(String username, String token, String repoName, int perPage) {
        if (username == null || username.isBlank()) return List.of();
        String url = githubApiBaseUrl + "/repos/" + username + "/" + repoName + "/commits?per_page=" + perPage;
        List<Map<String, Object>> commits = githubGet(url, token, new ParameterizedTypeReference<>() {});
        return commits != null ? commits : List.of();
    }

    public List<Map<String, Object>> getRepoContributors(String username, String token, String repoName) {
        if (username == null || username.isBlank()) return List.of();
        String url = githubApiBaseUrl + "/repos/" + username + "/" + repoName + "/contributors?per_page=50";
        List<Map<String, Object>> contributors = githubGet(url, token, new ParameterizedTypeReference<>() {});
        return contributors != null ? contributors : List.of();
    }

    public Map<String, Object> getRepoLanguages(String username, String token, String repoName) {
        if (username == null || username.isBlank()) return Map.of();
        String url = githubApiBaseUrl + "/repos/" + username + "/" + repoName + "/languages";
        Map<String, Object> langs = githubGet(url, token, new ParameterizedTypeReference<>() {});
        return langs != null ? langs : Map.of();
    }

    public List<Map<String, Object>> getRepoBranches(String username, String token, String repoName) {
        if (username == null || username.isBlank()) return List.of();
        String url = githubApiBaseUrl + "/repos/" + username + "/" + repoName + "/branches?per_page=100";
        List<Map<String, Object>> branches = githubGet(url, token, new ParameterizedTypeReference<>() {});
        return branches != null ? branches : List.of();
    }

    public List<Map<String, Object>> getRepoIssues(String username, String token, String repoName, String state) {
        if (username == null || username.isBlank()) return List.of();
        String url = githubApiBaseUrl + "/repos/" + username + "/" + repoName + "/issues?state=" + state + "&per_page=50";
        List<Map<String, Object>> issues = githubGet(url, token, new ParameterizedTypeReference<>() {});
        return issues != null ? issues : List.of();
    }

    public List<Map<String, Object>> getPullRequests(String username, String token, String repoName, String state) {
        if (username == null || username.isBlank()) return List.of();
        String url = githubApiBaseUrl + "/repos/" + username + "/" + repoName + "/pulls?state=" + state + "&per_page=50";
        List<Map<String, Object>> prs = githubGet(url, token, new ParameterizedTypeReference<>() {});
        return prs != null ? prs : List.of();
    }

    public Map<String, Object> getUserProfile(String username, String token) {
        if (username == null || username.isBlank()) return Map.of();
        String url = githubApiBaseUrl + "/users/" + username;
        return githubGet(url, token, new ParameterizedTypeReference<>() {});
    }

    public Map<String, Object> getGithubStats(String username, String token) {
        if (username == null || username.isBlank()) return Map.of();
        List<Map<String, Object>> repos = getUserRepos(username, token);
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
        stats.put("username", username);
        return stats;
    }
}
