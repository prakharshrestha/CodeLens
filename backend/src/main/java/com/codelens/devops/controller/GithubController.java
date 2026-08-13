package com.codelens.devops.controller;

import com.codelens.devops.dto.ApiResponse;
import com.codelens.devops.entity.User;
import com.codelens.devops.service.GithubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/github")
@RequiredArgsConstructor
public class GithubController {

    private final GithubService githubService;

    private void checkConfig(User user) {
        if (user.getGithubUsername() == null || user.getGithubUsername().isBlank() ||
            user.getGithubToken() == null || user.getGithubToken().isBlank()) {
            throw new RuntimeException("GitHub credentials not configured. Please update them in Settings.");
        }
    }

    @GetMapping("/repos")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRepositories(@AuthenticationPrincipal User user) {
        checkConfig(user);
        return ResponseEntity.ok(ApiResponse.success(githubService.getUserRepos(user.getGithubUsername(), user.getGithubToken())));
    }

    @GetMapping("/repos/{repoName}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRepository(
            @PathVariable String repoName,
            @AuthenticationPrincipal User user) {
        checkConfig(user);
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoDetails(user.getGithubUsername(), user.getGithubToken(), repoName)));
    }

    @GetMapping("/repos/{repoName}/commits")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCommits(
            @PathVariable String repoName,
            @RequestParam(defaultValue = "30") int perPage,
            @AuthenticationPrincipal User user) {
        checkConfig(user);
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoCommits(user.getGithubUsername(), user.getGithubToken(), repoName, perPage)));
    }

    @GetMapping("/repos/{repoName}/contributors")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getContributors(
            @PathVariable String repoName,
            @AuthenticationPrincipal User user) {
        checkConfig(user);
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoContributors(user.getGithubUsername(), user.getGithubToken(), repoName)));
    }

    @GetMapping("/repos/{repoName}/languages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLanguages(
            @PathVariable String repoName,
            @AuthenticationPrincipal User user) {
        checkConfig(user);
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoLanguages(user.getGithubUsername(), user.getGithubToken(), repoName)));
    }

    @GetMapping("/repos/{repoName}/branches")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBranches(
            @PathVariable String repoName,
            @AuthenticationPrincipal User user) {
        checkConfig(user);
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoBranches(user.getGithubUsername(), user.getGithubToken(), repoName)));
    }

    @GetMapping("/repos/{repoName}/issues")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getIssues(
            @PathVariable String repoName,
            @RequestParam(defaultValue = "open") String state,
            @AuthenticationPrincipal User user) {
        checkConfig(user);
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoIssues(user.getGithubUsername(), user.getGithubToken(), repoName, state)));
    }

    @GetMapping("/repos/{repoName}/pulls")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPullRequests(
            @PathVariable String repoName,
            @RequestParam(defaultValue = "open") String state,
            @AuthenticationPrincipal User user) {
        checkConfig(user);
        return ResponseEntity.ok(ApiResponse.success(githubService.getPullRequests(user.getGithubUsername(), user.getGithubToken(), repoName, state)));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserProfile(@AuthenticationPrincipal User user) {
        checkConfig(user);
        return ResponseEntity.ok(ApiResponse.success(githubService.getUserProfile(user.getGithubUsername(), user.getGithubToken())));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(@AuthenticationPrincipal User user) {
        checkConfig(user);
        return ResponseEntity.ok(ApiResponse.success(githubService.getGithubStats(user.getGithubUsername(), user.getGithubToken())));
    }
}
