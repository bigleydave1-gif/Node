FROM python:3.11-slim

WORKDIR /app

# Install git for versioning
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY core/ ./core/
COPY guardian/ ./guardian/
COPY web/ ./web/

# Create workspace directory
RUN mkdir -p workspace

# Expose port
EXPOSE 8000

# Environment variables
ENV AI_WORKSPACE=/app/workspace
ENV HOST=0.0.0.0
ENV PORT=8000

# Run the application
CMD ["python", "-m", "web.backend"]