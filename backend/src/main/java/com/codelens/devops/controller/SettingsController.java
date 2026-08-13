package com.codelens.devops.controller;

import com.codelens.devops.dto.ApiResponse;
import com.codelens.devops.dto.SettingsRequest;
import com.codelens.devops.entity.User;
import com.codelens.devops.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<SettingsRequest>> getSettings(@AuthenticationPrincipal User user) {
        SettingsRequest settings = new SettingsRequest();
        settings.setGithubUsername(user.getGithubUsername());
        // Do not return the token for security reasons, or return a masked version
        settings.setGithubToken(user.getGithubToken() != null && !user.getGithubToken().isBlank() ? "********" : "");
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateSettings(
            @RequestBody SettingsRequest request,
            @AuthenticationPrincipal User user) {
        
        user.setGithubUsername(request.getGithubUsername());
        if (request.getGithubToken() != null && !request.getGithubToken().isBlank() && !request.getGithubToken().equals("********")) {
            user.setGithubToken(request.getGithubToken());
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully"));
    }
}
