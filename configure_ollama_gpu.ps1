# Configure Ollama for Intel UHD 620 GPU Acceleration
# This script sets up environment variables for optimal Intel GPU performance

Write-Host "🚀 Configuring Ollama for Intel UHD 620 GPU Acceleration..." -ForegroundColor Green

# Stop existing Ollama service if running
Write-Host "Stopping existing Ollama service..." -ForegroundColor Yellow
try {
    Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
} catch {
    Write-Host "No existing Ollama process found" -ForegroundColor Gray
}

# Set environment variables for Intel GPU optimization
Write-Host "Setting Intel GPU environment variables..." -ForegroundColor Yellow

# Enable Intel GPU compute
$env:OLLAMA_GPU_OVERRIDE = "1"
$env:OLLAMA_INTEL_GPU = "1"

# Optimize for Intel integrated graphics
$env:OLLAMA_NUM_PARALLEL = "2"  # Reduce parallel requests for integrated GPU
$env:OLLAMA_MAX_LOADED_MODELS = "1"  # Limit loaded models for memory efficiency

# Intel-specific optimizations
$env:SYCL_CACHE_PERSISTENT = "1"
$env:ONEAPI_DEVICE_SELECTOR = "level_zero:gpu"

# Memory optimizations for integrated GPU
$env:OLLAMA_MAX_VRAM = "512"  # Limit VRAM usage to 512MB for stability

Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "  OLLAMA_GPU_OVERRIDE = $env:OLLAMA_GPU_OVERRIDE" -ForegroundColor Gray
Write-Host "  OLLAMA_INTEL_GPU = $env:OLLAMA_INTEL_GPU" -ForegroundColor Gray
Write-Host "  OLLAMA_NUM_PARALLEL = $env:OLLAMA_NUM_PARALLEL" -ForegroundColor Gray
Write-Host "  OLLAMA_MAX_LOADED_MODELS = $env:OLLAMA_MAX_LOADED_MODELS" -ForegroundColor Gray
Write-Host "  OLLAMA_MAX_VRAM = $env:OLLAMA_MAX_VRAM" -ForegroundColor Gray

# Start Ollama with GPU acceleration
Write-Host "Starting Ollama with Intel GPU acceleration..." -ForegroundColor Green
Start-Process -FilePath "ollama" -ArgumentList "serve" -NoNewWindow

Start-Sleep -Seconds 3

# Test GPU acceleration
Write-Host "Testing GPU acceleration..." -ForegroundColor Yellow
ollama run llama3.2 "Hello, this is a test of GPU acceleration. Please respond briefly."

Write-Host "✅ Ollama GPU configuration complete!" -ForegroundColor Green
Write-Host "Monitor GPU usage in Task Manager > Performance > GPU to verify acceleration" -ForegroundColor Cyan
