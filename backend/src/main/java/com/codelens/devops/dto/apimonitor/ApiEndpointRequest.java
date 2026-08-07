package com.codelens.devops.dto.apimonitor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import lombok.Data;

@Data
public class ApiEndpointRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String url;
    @NotBlank
    private String method = "GET";
    private Integer expectedStatusCode = 200;
    @Positive
    private Integer checkIntervalSeconds = 60;
    @Positive
    private Integer timeoutMs = 10000;
    private String tags;
}
