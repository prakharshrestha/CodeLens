package com.codelens.devops.controller;

import com.codelens.devops.dto.ApiResponse;
import com.codelens.devops.service.JenkinsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jenkins")
@RequiredArgsConstructor
public class JenkinsController {

    private final JenkinsService jenkinsService;

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllJobs() {
        return ResponseEntity.ok(ApiResponse.success(jenkinsService.getAllJobs()));
    }

    @GetMapping("/jobs/{jobName}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getJobDetails(@PathVariable String jobName) {
        return ResponseEntity.ok(ApiResponse.success(jenkinsService.getJobDetails(jobName)));
    }

    @GetMapping("/jobs/{jobName}/builds")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBuildHistory(@PathVariable String jobName) {
        return ResponseEntity.ok(ApiResponse.success(jenkinsService.getJobBuildHistory(jobName)));
    }

    @GetMapping("/jobs/{jobName}/builds/{buildNumber}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBuildDetails(
            @PathVariable String jobName,
            @PathVariable int buildNumber) {
        return ResponseEntity.ok(ApiResponse.success(jenkinsService.getBuildDetails(jobName, buildNumber)));
    }

    @GetMapping("/jobs/{jobName}/builds/{buildNumber}/log")
    public ResponseEntity<ApiResponse<String>> getBuildLog(
            @PathVariable String jobName,
            @PathVariable int buildNumber) {
        return ResponseEntity.ok(ApiResponse.success(jenkinsService.getBuildLog(jobName, buildNumber)));
    }

    @PostMapping("/jobs/{jobName}/build")
    public ResponseEntity<ApiResponse<Void>> triggerBuild(@PathVariable String jobName) {
        jenkinsService.triggerBuild(jobName);
        return ResponseEntity.ok(ApiResponse.success("Build triggered for job: " + jobName, null));
    }

    @PostMapping("/jobs/{jobName}/builds/{buildNumber}/stop")
    public ResponseEntity<ApiResponse<Void>> stopBuild(
            @PathVariable String jobName,
            @PathVariable int buildNumber) {
        jenkinsService.stopBuild(jobName, buildNumber);
        return ResponseEntity.ok(ApiResponse.success("Build stopped", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getJenkinsStats() {
        return ResponseEntity.ok(ApiResponse.success(jenkinsService.getJenkinsStats()));
    }

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getJenkinsInfo() {
        return ResponseEntity.ok(ApiResponse.success(jenkinsService.getJenkinsInfo()));
    }
}
