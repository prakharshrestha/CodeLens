package com.codelens.devops.controller;

import com.codelens.devops.dto.ApiResponse;
import com.codelens.devops.service.GithubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/github")
@RequiredArgsConstructor
public class GithubController {

    private final GithubService githubService;

    @GetMapping("/repos")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRepositories() {
        return ResponseEntity.ok(ApiResponse.success(githubService.getUserRepos()));
    }

    @GetMapping("/repos/{repoName}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRepository(@PathVariable String repoName) {
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoDetails(repoName)));
    }

    @GetMapping("/repos/{repoName}/commits")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCommits(
            @PathVariable String repoName,
            @RequestParam(defaultValue = "30") int perPage) {
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoCommits(repoName, perPage)));
    }

    @GetMapping("/repos/{repoName}/contributors")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getContributors(@PathVariable String repoName) {
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoContributors(repoName)));
    }

    @GetMapping("/repos/{repoName}/languages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLanguages(@PathVariable String repoName) {
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoLanguages(repoName)));
    }

    @GetMapping("/repos/{repoName}/branches")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBranches(@PathVariable String repoName) {
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoBranches(repoName)));
    }

    @GetMapping("/repos/{repoName}/issues")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getIssues(
            @PathVariable String repoName,
            @RequestParam(defaultValue = "open") String state) {
        return ResponseEntity.ok(ApiResponse.success(githubService.getRepoIssues(repoName, state)));
    }

    @GetMapping("/repos/{repoName}/pulls")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPullRequests(
            @PathVariable String repoName,
            @RequestParam(defaultValue = "open") String state) {
        return ResponseEntity.ok(ApiResponse.success(githubService.getPullRequests(repoName, state)));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserProfile() {
        return ResponseEntity.ok(ApiResponse.success(githubService.getUserProfile()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(githubService.getGithubStats()));
    }
}
