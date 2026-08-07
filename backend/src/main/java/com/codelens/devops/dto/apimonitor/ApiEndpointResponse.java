package com.codelens.devops.dto.apimonitor;

import com.codelens.devops.entity.MonitoredApi;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiEndpointResponse {
    private Long id;
    private String name;
    private String url;
    private String method;
    private Integer expectedStatusCode;
    private Integer checkIntervalSeconds;
    private Integer timeoutMs;
    private MonitoredApi.Status status;
    private LocalDateTime lastChecked;
    private Long lastResponseTimeMs;
    private Double uptimePercentage;
    private Long totalChecks;
    private Long successfulChecks;
    private String tags;
    private boolean active;
    private LocalDateTime createdAt;
}
