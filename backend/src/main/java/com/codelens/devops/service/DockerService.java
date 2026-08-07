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
public class DockerService {

    @Value("${docker.host}")
    private String dockerHost;

    private final RestTemplate restTemplate = new RestTemplate();

    private String getBaseUrl() {
        // Convert tcp:// to http:// for REST calls
        return dockerHost.replace("tcp://", "http://");
    }

    private <T> T dockerGet(String path, ParameterizedTypeReference<T> type) {
        try {
            String url = getBaseUrl() + path;
            ResponseEntity<T> response = restTemplate.exchange(url, HttpMethod.GET, null, type);
            return response.getBody();
        } catch (Exception e) {
            log.warn("Docker API error for path {}: {}", path, e.getMessage());
            return null;
        }
    }

    private ResponseEntity<String> dockerPost(String path) {
        try {
            String url = getBaseUrl() + path;
            return restTemplate.postForEntity(url, null, String.class);
        } catch (Exception e) {
            log.error("Docker POST error for path {}: {}", path, e.getMessage());
            throw new RuntimeException("Docker operation failed: " + e.getMessage());
        }
    }

    private void dockerDelete(String path) {
        try {
            String url = getBaseUrl() + path;
            restTemplate.delete(url);
        } catch (Exception e) {
            log.error("Docker DELETE error for path {}: {}", path, e.getMessage());
            throw new RuntimeException("Docker operation failed: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> getAllContainers() {
        List<Map<String, Object>> containers = dockerGet("/v1.41/containers/json?all=true", new ParameterizedTypeReference<>() {});
        return containers != null ? containers : List.of();
    }

    public Map<String, Object> getContainerDetails(String containerId) {
        return dockerGet("/v1.41/containers/" + containerId + "/json", new ParameterizedTypeReference<>() {});
    }

    public Map<String, Object> getContainerStats(String containerId) {
        return dockerGet("/v1.41/containers/" + containerId + "/stats?stream=false", new ParameterizedTypeReference<>() {});
    }

    public String getContainerLogs(String containerId) {
        try {
            String url = getBaseUrl() + "/v1.41/containers/" + containerId + "/logs?stdout=true&stderr=true&tail=100";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, null, String.class);
            return response.getBody() != null ? response.getBody() : "No logs available";
        } catch (Exception e) {
            log.error("Error getting container logs: {}", e.getMessage());
            return "Error retrieving logs: " + e.getMessage();
        }
    }

    public void startContainer(String containerId) {
        dockerPost("/v1.41/containers/" + containerId + "/start");
    }

    public void stopContainer(String containerId) {
        dockerPost("/v1.41/containers/" + containerId + "/stop");
    }

    public void restartContainer(String containerId) {
        dockerPost("/v1.41/containers/" + containerId + "/restart");
    }

    public void removeContainer(String containerId) {
        dockerDelete("/v1.41/containers/" + containerId + "?force=true");
    }

    public List<Map<String, Object>> getAllImages() {
        List<Map<String, Object>> images = dockerGet("/v1.41/images/json", new ParameterizedTypeReference<>() {});
        return images != null ? images : List.of();
    }

    public void deleteImage(String imageId) {
        dockerDelete("/v1.41/images/" + imageId + "?force=true");
    }

    public List<Map<String, Object>> getAllVolumes() {
        Map<String, Object> result = dockerGet("/v1.41/volumes", new ParameterizedTypeReference<>() {});
        if (result != null && result.get("Volumes") instanceof List<?> volumes) {
            return volumes.stream().filter(v -> v instanceof Map).map(v -> (Map<String, Object>) v).toList();
        }
        return List.of();
    }

    public List<Map<String, Object>> getAllNetworks() {
        List<Map<String, Object>> networks = dockerGet("/v1.41/networks", new ParameterizedTypeReference<>() {});
        return networks != null ? networks : List.of();
    }

    public Map<String, Object> getDockerInfo() {
        return dockerGet("/v1.41/info", new ParameterizedTypeReference<>() {});
    }

    public Map<String, Object> getDockerStats() {
        List<Map<String, Object>> allContainers = getAllContainers();
        long running = allContainers.stream()
                .filter(c -> "running".equals(c.get("State")))
                .count();
        long stopped = allContainers.stream()
                .filter(c -> "exited".equals(c.get("State")))
                .count();
        long paused = allContainers.stream()
                .filter(c -> "paused".equals(c.get("State")))
                .count();
        return Map.of(
            "totalContainers", allContainers.size(),
            "runningContainers", running,
            "stoppedContainers", stopped,
            "pausedContainers", paused,
            "totalImages", getAllImages().size()
        );
    }

    public boolean isDockerAvailable() {
        try {
            Map<String, Object> info = getDockerInfo();
            return info != null;
        } catch (Exception e) {
            return false;
        }
    }
}
