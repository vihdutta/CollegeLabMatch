# Use Python 3.11 Alpine image as base
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Alpine
RUN apk add --no-cache \
    build-base \
    gcc \
    musl-dev \
    postgresql-dev

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