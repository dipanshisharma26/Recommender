# Deployment Guide for SHL Assessment Recommender

This guide outlines how to deploy your monolithic RAG application (FastAPI backend + React frontend) to various free hosting platforms. 

The project contains a multi-stage `Dockerfile` that bakes both the Node frontend compilation and the Hugging Face sentence-transformers model directly into the image. This ensures instant container startup, preventing timeouts on memory-constrained free plans.

---

## Prerequisites
No matter which platform you choose, you must configure the following environment variable in the platform's settings dashboard:
* **`GOOGLE_API_KEY`**: Your Gemini API key.

---

## 1. Render (Web Services - Free Tier)
Render supports deploying web apps directly from GitHub via Docker.

1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   * **Runtime**: `Docker`
   * **Instance Type**: `Free`
5. Go to the **Environment** tab and add your environment variable:
   * `GOOGLE_API_KEY` = `your_gemini_api_key`
6. Click **Deploy Web Service**. Render will read the `Dockerfile`, build it, and serve it on a public `.onrender.com` URL.

---

## 2. Railway (Free Hobby Plan)
Railway automatically detects Dockerfiles and starts the app instantly.

1. Go to [Railway.app](https://railway.app/) and sign in.
2. Click **New Project > Deploy from GitHub repo**.
3. Select your repository.
4. Click **Add Variables** and configure:
   * `GOOGLE_API_KEY` = `your_gemini_api_key`
5. Railway will automatically build and host the app. Once finished, go to the **Settings** tab of the service, scroll down to **Environment**, and click **Generate Domain** to get your public URL.

---

## 3. Hugging Face Spaces (Docker SDK - Free CPU)
Hugging Face Spaces is an excellent free hosting environment that supports custom Docker containers.

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create New Space**.
2. Set the following configuration:
   * **Space SDK**: Select **Docker** (instead of Gradio/Streamlit).
   * **Docker Template**: Choose **Blank**.
   * **Space License**: `Apache-2.0` (or preference).
   * **Visibility**: Public/Private.
3. Click **Create Space**.
4. Hugging Face will show you git instructions to push your code. Push your local files to the HF Space remote.
5. In your Space's settings page, scroll down to **Variables and Secrets** and click **New Secret** to add:
   * Name: `GOOGLE_API_KEY`
   * Value: `your_gemini_api_key`
6. Hugging Face will compile the Dockerfile and launch the interface directly in your Space dashboard.

---

## 4. Fly.io (Hobby Tier)
Fly.io runs raw Docker containers on a micro-VM.

1. Install the `flyctl` CLI tool on your machine.
2. Log in from your terminal:
   ```bash
   fly auth login
   ```
3. Initialize the app launcher inside the project directory:
   ```bash
   fly launch
   ```
   * It will automatically detect the `Dockerfile`.
   * Set a name and choose a nearby region.
   * When asked to tweak settings, say **Yes** to verify configs, or **No** to default.
4. Set your API Key secret:
   ```bash
   fly secrets set GOOGLE_API_KEY="your_gemini_api_key"
   ```
5. Deploy the app:
   ```bash
   fly deploy
   ```
