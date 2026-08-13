# Cloud Deployment Guide (Free Tier)

This guide walks you through deploying the DevOps Command Center to the internet for free.

## Step 1: Set up the Database (Neon.tech)
1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Click **New Project** (Name it `devops-db`, Postgres version 15).
3. Once created, go to your **Dashboard**. 
4. Find the **Connection String** (it starts with `postgres://...`). Save this somewhere; you will need it for the Backend!

## Step 2: Deploy the Backend (Render.com)
1. Go to [Render.com](https://render.com/) and create a free account with your GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your `CodeLens` GitHub repository.
4. Fill out the deployment details:
   - **Name:** `devops-backend` (or similar)
   - **Root Directory:** `backend` (CRITICAL: You must type `backend` here because the Java code is in that folder).
   - **Environment:** `Docker`
   - **Instance Type:** `Free`
5. Scroll down to **Environment Variables** and add the following:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<your_neon_host>/neondb?sslmode=require` (Replace with your actual Neon string, but ensure it starts with `jdbc:postgresql://` instead of `postgres://`).
   - `DB_USERNAME`: (Your Neon username)
   - `DB_PASSWORD`: (Your Neon password)
   - `JWT_SECRET`: Generate a random 64-character string (or use `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970`).
6. Click **Create Web Service**. It will take about 3-5 minutes to build.
7. Once deployed, copy your new backend URL (e.g., `https://devops-backend-abc.onrender.com`).

## Step 3: Deploy the Frontend (Vercel.com)
1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New** -> **Project**.
3. Import your `CodeLens` repository.
4. In the configuration screen:
   - **Framework Preset:** Vite
   - **Root Directory:** Edit this and select `frontend`.
5. Open the **Environment Variables** dropdown and add:
   - `VITE_API_BASE_URL`: `https://devops-backend-abc.onrender.com/api` (Replace with your actual Render URL from Step 2. Don't forget the `/api` at the end!)
6. Click **Deploy**.

## Conclusion
Once Vercel finishes building (usually < 1 minute), click on the generated public link. You will see your dashboard live on the internet! 

*Note: Since the backend is running on a cloud server, the Docker Manager tab will not show your local laptop's Docker containers.*
