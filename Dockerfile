# Use Python 3.10 slim image as base (Debian-based)
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Debian
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port 8001
EXPOSE 8001

# Change working directory to backend and run main.py directly
WORKDIR /app/backend
CMD ["python", "main.py"] 