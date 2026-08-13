# DevOps Command Center - Project Context

**This file acts as the persistent context and memory for the project. Its purpose is to reduce unnecessary re-analysis and token usage during future development sessions. It must be updated whenever there is a significant architectural or feature change.**

## 1. Project Overview
**DevOps Command Center** is a centralized web-based dashboard designed to simplify the monitoring and management of the complete software development and deployment lifecycle. It provides a unified interface to view analytics, manage infrastructure, monitor deployments, and track application health in real-time, eliminating the need to switch between multiple tools (GitHub, Docker, Jenkins, API monitors).

## 2. Technology Stack
*   **Frontend**: React, Vite, JavaScript, CSS (Vanilla, styled with modern dark-mode glassmorphism aesthetics).
*   **Backend**: Java 11, Spring Boot 2.7.18, Spring Security 5.x (JWT-based authentication).
*   **Database**: PostgreSQL 15.
*   **Infrastructure**: Docker, Docker Compose (for orchestration), Nginx (serving the frontend and proxying `/api` requests).

## 3. Core Modules
1.  **GitHub Analytics**: Provides repository insights, commit analysis, contributor stats, and branch activity. Requires a Personal Access Token (`GITHUB_TOKEN` environment variable).
2.  **Docker Container Manager**: Manages local Docker containers (view status, CPU/RAM, logs, start/stop containers). Connects via `tcp://host.docker.internal:2375`.
3.  **API Monitor**: Pings configured endpoints to track uptime, response time, and HTTP status codes.
4.  **Jenkins CI/CD**: Monitors build pipelines (Future/WIP integration).
5.  **Dashboard Overview**: A unified screen aggregating data from all the above modules.

## 4. Architecture Notes
*   **Authentication**: Custom JWT filter intercepts requests to `/api/**`. The token is stored in `localStorage` (`codelens-auth`) on the frontend.
*   **Routing**: The Spring Boot backend context path is set to `/api` (via `application.yml`). Therefore, Spring Security `antMatchers` operate relative to this path (e.g., `/auth/**` matches `http://localhost:8080/api/auth/**`).
*   **Docker Setup**: 
    *   `codelens_db`: PostgreSQL container (port 5432).
    *   `codelens_backend`: Spring Boot REST API (port 8080).
    *   `codelens_frontend`: Nginx serving Vite build (port 3000, proxies `/api/` to backend).
*   **Java Versioning Constraint**: The project strictly uses **Java 11**. Avoid modern Java 16+ syntax (like pattern matching for `instanceof`, `List.copyOf`, or `.toList()`).

## 5. Current Progress / Status (Last Updated: August 2026)
*   **Accomplished**:
    *   Successfully created the backend structure (Entities, Repositories, Services, Controllers).
    *   Successfully created the frontend React structure and styling.
    *   Successfully dockerized the entire application via `docker-compose`.
    *   Fixed Spring Security `antMatchers` and Java 11 compatibility issues.
    *   JWT Registration and Login are fully functional.
*   **Next Steps for Future Sessions**:
    *   Populate Jenkins CI/CD module functionality.
    *   Expand UI features and flesh out detailed monitoring logic.
    *   Add automated tests for core services.
