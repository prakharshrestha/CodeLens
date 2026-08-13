package com.codelens.devops.dto;

import lombok.Data;

@Data
public class SettingsRequest {
    private String githubUsername;
    private String githubToken;
}
