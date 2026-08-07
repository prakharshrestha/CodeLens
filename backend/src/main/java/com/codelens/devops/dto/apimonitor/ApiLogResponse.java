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
public class ApiLogResponse {
    private Long id;
    private Long apiId;
    private String apiName;
    private Integer statusCode;
    private Long responseTimeMs;
    private MonitoredApi.Status status;
    private String errorMessage;
    private LocalDateTime checkedAt;
}
