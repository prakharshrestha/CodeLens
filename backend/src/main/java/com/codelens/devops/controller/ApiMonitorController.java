package com.codelens.devops.controller;

import com.codelens.devops.dto.ApiResponse;
import com.codelens.devops.dto.apimonitor.*;
import com.codelens.devops.service.ApiMonitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/monitor")
@RequiredArgsConstructor
public class ApiMonitorController {

    private final ApiMonitorService apiMonitorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ApiEndpointResponse>>> getAllApis() {
        return ResponseEntity.ok(ApiResponse.success(apiMonitorService.getAllApis()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApiEndpointResponse>> getApi(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(apiMonitorService.getApiById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApiEndpointResponse>> addApi(@Valid @RequestBody ApiEndpointRequest request) {
        return ResponseEntity.ok(ApiResponse.success("API added successfully", apiMonitorService.addApi(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ApiEndpointResponse>> updateApi(
            @PathVariable Long id,
            @Valid @RequestBody ApiEndpointRequest request) {
        return ResponseEntity.ok(ApiResponse.success("API updated", apiMonitorService.updateApi(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApi(@PathVariable Long id) {
        apiMonitorService.deleteApi(id);
        return ResponseEntity.ok(ApiResponse.success("API deleted", null));
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<ApiResponse<List<ApiLogResponse>>> getApiLogs(
            @PathVariable Long id,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(ApiResponse.success(apiMonitorService.getApiLogs(id, limit)));
    }

    @PostMapping("/{id}/check")
    public ResponseEntity<ApiResponse<ApiEndpointResponse>> checkNow(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Health check completed", apiMonitorService.checkApiNow(id)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(apiMonitorService.getApiStats()));
    }
}
