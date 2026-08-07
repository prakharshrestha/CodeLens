package com.codelens.devops.controller;

import com.codelens.devops.dto.ApiResponse;
import com.codelens.devops.service.DockerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/docker")
@RequiredArgsConstructor
public class DockerController {

    private final DockerService dockerService;

    @GetMapping("/containers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getContainers() {
        return ResponseEntity.ok(ApiResponse.success(dockerService.getAllContainers()));
    }

    @GetMapping("/containers/{containerId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getContainerDetails(@PathVariable String containerId) {
        return ResponseEntity.ok(ApiResponse.success(dockerService.getContainerDetails(containerId)));
    }

    @GetMapping("/containers/{containerId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getContainerStats(@PathVariable String containerId) {
        return ResponseEntity.ok(ApiResponse.success(dockerService.getContainerStats(containerId)));
    }

    @GetMapping("/containers/{containerId}/logs")
    public ResponseEntity<ApiResponse<String>> getContainerLogs(@PathVariable String containerId) {
        return ResponseEntity.ok(ApiResponse.success(dockerService.getContainerLogs(containerId)));
    }

    @PostMapping("/containers/{containerId}/start")
    public ResponseEntity<ApiResponse<Void>> startContainer(@PathVariable String containerId) {
        dockerService.startContainer(containerId);
        return ResponseEntity.ok(ApiResponse.success("Container started", null));
    }

    @PostMapping("/containers/{containerId}/stop")
    public ResponseEntity<ApiResponse<Void>> stopContainer(@PathVariable String containerId) {
        dockerService.stopContainer(containerId);
        return ResponseEntity.ok(ApiResponse.success("Container stopped", null));
    }

    @PostMapping("/containers/{containerId}/restart")
    public ResponseEntity<ApiResponse<Void>> restartContainer(@PathVariable String containerId) {
        dockerService.restartContainer(containerId);
        return ResponseEntity.ok(ApiResponse.success("Container restarted", null));
    }

    @DeleteMapping("/containers/{containerId}")
    public ResponseEntity<ApiResponse<Void>> removeContainer(@PathVariable String containerId) {
        dockerService.removeContainer(containerId);
        return ResponseEntity.ok(ApiResponse.success("Container removed", null));
    }

    @GetMapping("/images")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getImages() {
        return ResponseEntity.ok(ApiResponse.success(dockerService.getAllImages()));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable String imageId) {
        dockerService.deleteImage(imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted", null));
    }

    @GetMapping("/volumes")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVolumes() {
        return ResponseEntity.ok(ApiResponse.success(dockerService.getAllVolumes()));
    }

    @GetMapping("/networks")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNetworks() {
        return ResponseEntity.ok(ApiResponse.success(dockerService.getAllNetworks()));
    }

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDockerInfo() {
        return ResponseEntity.ok(ApiResponse.success(dockerService.getDockerInfo()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDockerStats() {
        return ResponseEntity.ok(ApiResponse.success(dockerService.getDockerStats()));
    }
}
