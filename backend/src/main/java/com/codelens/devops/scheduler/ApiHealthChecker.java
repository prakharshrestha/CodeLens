package com.codelens.devops.scheduler;

import com.codelens.devops.entity.MonitoredApi;
import com.codelens.devops.repository.MonitoredApiRepository;
import com.codelens.devops.service.ApiMonitorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApiHealthChecker {

    private final MonitoredApiRepository apiRepository;
    private final ApiMonitorService apiMonitorService;

    @Scheduled(cron = "${scheduler.api-health-cron}")
    public void checkAllApis() {
        List<MonitoredApi> activeApis = apiRepository.findByActiveTrue();
        log.debug("Running health checks for {} APIs", activeApis.size());
        for (MonitoredApi api : activeApis) {
            try {
                apiMonitorService.performHealthCheck(api);
            } catch (Exception e) {
                log.error("Error checking API {}: {}", api.getName(), e.getMessage());
            }
        }
    }
}
