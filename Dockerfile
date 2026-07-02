# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Monolithic Python Application
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies needed for compiling certain python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the Hugging Face embedding model during build time
# This prevents timeouts and downloads on container startup
ENV HF_HOME=/app/.cache/huggingface
RUN python -c "from langchain_huggingface import HuggingFaceEmbeddings; HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')"

# Copy Python application files
COPY agent.py main.py vector_store.py shl_product_catalogue.json ./
COPY faiss_index/ ./faiss_index/

# Copy the built React static files from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (FastAPI default)
EXPOSE 8000

# Start the application, dynamically binding to the $PORT environment variable
# injected by hosting platforms (Render, Fly.io, Railway, etc.), defaulting to 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
