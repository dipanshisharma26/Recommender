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

# Install runtime dependencies for FAISS (OpenMP is required by faiss-cpu)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY requirements.txt .

# CRITICAL OPTIMIZATION FOR RENDER (512MB RAM limit):
# Install the CPU-only version of PyTorch first. The default PyTorch on PyPI includes
# heavy CUDA binaries (~700MB+), which will cause Out-Of-Memory (OOM) build failures on Render.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the dependencies
RUN pip install --no-cache-dir -r requirements.txt

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
