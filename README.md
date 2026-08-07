# CodeLens — DevOps Command Center

A centralized DevOps monitoring and management platform built with **Spring Boot**, **React**, and **PostgreSQL**.

![Tech Stack](https://img.shields.io/badge/Backend-Spring%20Boot%203.x-green)
![React](https://img.shields.io/badge/Frontend-React%2018-blue)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Docker](https://img.shields.io/badge/Container-Docker-blue)

## Features

| Module | Description |
|--------|-------------|
| 🔐 **Auth** | JWT-based authentication with Role-Based Access Control |
| 📊 **Dashboard** | Real-time aggregate stats and charts |
| 🐙 **GitHub Analytics** | Repositories, commits, contributors, languages |
| 🐳 **Docker Manager** | Container lifecycle management with logs |
| ⚙️ **Jenkins CI/CD** | Job management, build triggers, console logs |
| 📡 **API Monitor** | Real-time HTTP health checks with history |

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### 1. Clone & Configure
```bash
git clone https://github.com/prakharshrestha/CodeLens.git
cd CodeLens
cp .env.example .env
# Edit .env with your credentials
```

### 2. Start Database
```bash
docker run -d --name codelens_db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=codelens_db -p 5432:5432 postgres:15
```

### 3. Start Backend
```bash
cd backend
# Set environment variables from .env or configure application.yml
mvn spring-boot:run
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Access the app at **http://localhost:5173**

---

### Full Docker Compose Setup
```bash
cp .env.example .env
# Fill in your GITHUB_TOKEN, JENKINS credentials, etc.
docker-compose up -d
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/api/swagger-ui.html

---

## Configuration

Edit `.env` or set environment variables:

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub Personal Access Token (read access) |
| `GITHUB_USERNAME` | GitHub username to monitor |
| `JENKINS_URL` | Jenkins server URL |
| `JENKINS_TOKEN` | Jenkins API token |
| `DOCKER_HOST` | Docker daemon TCP address |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | JWT signing secret (32+ chars) |

### Enabling Docker TCP API
On Linux: Edit `/etc/docker/daemon.json`:
```json
{ "hosts": ["tcp://0.0.0.0:2375", "unix:///var/run/docker.sock"] }
```

On Windows Docker Desktop: Settings → General → "Expose daemon on tcp://localhost:2375"

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              React Frontend (Vite)              │
│     Dashboard │ GitHub │ Docker │ Jenkins │ API │
└─────────────────────────────────────────────────┘
                       │ REST API
┌─────────────────────────────────────────────────┐
│           Spring Boot Backend                   │
│  JWT Auth │ GitHub API │ Docker API │ Jenkins   │
└─────────────────────────────────────────────────┘
                       │ JPA
┌─────────────────────────────────────────────────┐
│              PostgreSQL Database                │
│  Users │ APIs │ Logs │ Alerts                  │
└─────────────────────────────────────────────────┘
```

## API Documentation

Swagger UI available at: `http://localhost:8080/api/swagger-ui.html`

## Tech Stack

**Backend**: Java 17, Spring Boot 3.2, Spring Security, JWT, Spring Data JPA, PostgreSQL, Lombok, SpringDoc OpenAPI

**Frontend**: React 18, Vite, React Router, TanStack Query, Zustand, Recharts, Framer Motion, Lucide Icons, Axios

**DevOps**: Docker, Docker Compose, Jenkins, GitHub Actions, Nginx

## License

MIT License — Free to use and modify.
