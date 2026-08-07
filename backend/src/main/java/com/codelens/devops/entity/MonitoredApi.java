package com.codelens.devops.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "monitored_apis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitoredApi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String method;

    @Column(name = "expected_status_code")
    private Integer expectedStatusCode;

    @Column(name = "check_interval_seconds")
    private Integer checkIntervalSeconds;

    @Column(name = "timeout_ms")
    private Integer timeoutMs;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "last_checked")
    private LocalDateTime lastChecked;

    @Column(name = "last_response_time_ms")
    private Long lastResponseTimeMs;

    @Column(name = "uptime_percentage")
    private Double uptimePercentage;

    @Column(name = "total_checks")
    private Long totalChecks;

    @Column(name = "successful_checks")
    private Long successfulChecks;

    private String tags;
    private boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "api", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ApiLog> logs = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (expectedStatusCode == null) expectedStatusCode = 200;
        if (checkIntervalSeconds == null) checkIntervalSeconds = 60;
        if (timeoutMs == null) timeoutMs = 10000;
        if (totalChecks == null) totalChecks = 0L;
        if (successfulChecks == null) successfulChecks = 0L;
        if (uptimePercentage == null) uptimePercentage = 0.0;
        if (status == null) status = Status.UNKNOWN;
        if (!active) active = true;
    }

    public enum Status { HEALTHY, DOWN, SLOW, UNKNOWN }
}
