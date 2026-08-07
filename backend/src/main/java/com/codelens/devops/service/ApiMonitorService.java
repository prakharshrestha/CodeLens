package com.codelens.devops.service;

import com.codelens.devops.dto.apimonitor.*;
import com.codelens.devops.entity.Alert;
import com.codelens.devops.entity.ApiLog;
import com.codelens.devops.entity.MonitoredApi;
import com.codelens.devops.exception.ResourceNotFoundException;
import com.codelens.devops.repository.AlertRepository;
import com.codelens.devops.repository.ApiLogRepository;
import com.codelens.devops.repository.MonitoredApiRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiMonitorService {

    private final MonitoredApiRepository apiRepository;
    private final ApiLogRepository apiLogRepository;
    private final AlertRepository alertRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public ApiEndpointResponse addApi(ApiEndpointRequest request) {
        MonitoredApi api = MonitoredApi.builder()
                .name(request.getName())
                .url(request.getUrl())
                .method(request.getMethod())
                .expectedStatusCode(request.getExpectedStatusCode())
                .checkIntervalSeconds(request.getCheckIntervalSeconds())
                .timeoutMs(request.getTimeoutMs())
                .tags(request.getTags())
                .active(true)
                .build();
        return toResponse(apiRepository.save(api));
    }

    @Transactional
    public ApiEndpointResponse updateApi(Long id, ApiEndpointRequest request) {
        MonitoredApi api = apiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("API", id));
        api.setName(request.getName());
        api.setUrl(request.getUrl());
        api.setMethod(request.getMethod());
        api.setExpectedStatusCode(request.getExpectedStatusCode());
        api.setCheckIntervalSeconds(request.getCheckIntervalSeconds());
        api.setTimeoutMs(request.getTimeoutMs());
        api.setTags(request.getTags());
        return toResponse(apiRepository.save(api));
    }

    @Transactional
    public void deleteApi(Long id) {
        if (!apiRepository.existsById(id)) {
            throw new ResourceNotFoundException("API", id);
        }
        apiRepository.deleteById(id);
    }

    public List<ApiEndpointResponse> getAllApis() {
        return apiRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ApiEndpointResponse getApiById(Long id) {
        return toResponse(apiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("API", id)));
    }

    public List<ApiLogResponse> getApiLogs(Long id, int limit) {
        MonitoredApi api = apiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("API", id));
        return apiLogRepository.findByApiOrderByCheckedAtDesc(api, PageRequest.of(0, limit))
                .stream().map(l -> toLogResponse(l)).collect(Collectors.toList());
    }

    @Transactional
    public ApiEndpointResponse checkApiNow(Long id) {
        MonitoredApi api = apiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("API", id));
        performHealthCheck(api);
        return toResponse(apiRepository.findById(id).orElseThrow());
    }

    @Transactional
    public void performHealthCheck(MonitoredApi api) {
        long startTime = System.currentTimeMillis();
        ApiLog.ApiLogBuilder logBuilder = ApiLog.builder().api(api);
        MonitoredApi.Status status;
        try {
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            HttpMethod method = HttpMethod.valueOf(api.getMethod());
            ResponseEntity<String> response = restTemplate.exchange(
                api.getUrl(), method, entity, String.class);
            long responseTime = System.currentTimeMillis() - startTime;
            int statusCode = response.getStatusCode().value();
            status = (statusCode == api.getExpectedStatusCode()) ?
                (responseTime > 5000 ? MonitoredApi.Status.SLOW : MonitoredApi.Status.HEALTHY) :
                MonitoredApi.Status.DOWN;
            logBuilder.statusCode(statusCode).responseTimeMs(responseTime).status(status);
            api.setLastResponseTimeMs(responseTime);
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            status = MonitoredApi.Status.DOWN;
            logBuilder.status(status).errorMessage(e.getMessage()).responseTimeMs(responseTime);
            createDownAlert(api, e.getMessage());
        }
        api.setLastChecked(LocalDateTime.now());
        api.setStatus(status);
        api.setTotalChecks(api.getTotalChecks() + 1);
        if (status == MonitoredApi.Status.HEALTHY) api.setSuccessfulChecks(api.getSuccessfulChecks() + 1);
        double uptime = api.getTotalChecks() > 0 ?
            (double) api.getSuccessfulChecks() / api.getTotalChecks() * 100 : 0;
        api.setUptimePercentage(uptime);
        apiRepository.save(api);
        apiLogRepository.save(logBuilder.build());
    }

    private void createDownAlert(MonitoredApi api, String errorMessage) {
        Alert alert = Alert.builder()
                .title("API Down: " + api.getName())
                .message("API " + api.getUrl() + " is unreachable. Error: " + errorMessage)
                .severity(Alert.Severity.CRITICAL)
                .category(Alert.Category.API_MONITOR)
                .sourceId(api.getId().toString())
                .read(false)
                .build();
        alertRepository.save(alert);
    }

    public Map<String, Long> getApiStats() {
        return Map.of(
            "total", apiRepository.countByActiveTrue(),
            "healthy", apiRepository.countByStatus(MonitoredApi.Status.HEALTHY),
            "down", apiRepository.countByStatus(MonitoredApi.Status.DOWN),
            "slow", apiRepository.countByStatus(MonitoredApi.Status.SLOW),
            "unknown", apiRepository.countByStatus(MonitoredApi.Status.UNKNOWN)
        );
    }

    private ApiEndpointResponse toResponse(MonitoredApi api) {
        return ApiEndpointResponse.builder()
                .id(api.getId())
                .name(api.getName())
                .url(api.getUrl())
                .method(api.getMethod())
                .expectedStatusCode(api.getExpectedStatusCode())
                .checkIntervalSeconds(api.getCheckIntervalSeconds())
                .timeoutMs(api.getTimeoutMs())
                .status(api.getStatus())
                .lastChecked(api.getLastChecked())
                .lastResponseTimeMs(api.getLastResponseTimeMs())
                .uptimePercentage(api.getUptimePercentage())
                .totalChecks(api.getTotalChecks())
                .successfulChecks(api.getSuccessfulChecks())
                .tags(api.getTags())
                .active(api.isActive())
                .createdAt(api.getCreatedAt())
                .build();
    }

    private ApiLogResponse toLogResponse(ApiLog log) {
        return ApiLogResponse.builder()
                .id(log.getId())
                .apiId(log.getApi().getId())
                .apiName(log.getApi().getName())
                .statusCode(log.getStatusCode())
                .responseTimeMs(log.getResponseTimeMs())
                .status(log.getStatus())
                .errorMessage(log.getErrorMessage())
                .checkedAt(log.getCheckedAt())
                .build();
    }
}
