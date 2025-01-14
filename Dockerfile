# Use an official Python runtime as the base image
FROM python:3.8-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential python3-dev libffi-dev libssl-dev \
    libxml2-dev libxslt1-dev zlib1g-dev libsqlite3-dev libblas-dev \
    liblapack-dev gfortran libopenblas-dev libomp-dev \
    gcc \
    pkg-config \
    rustc cargo     && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app
RUN pip install pip --upgrade
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

EXPOSE 8000
