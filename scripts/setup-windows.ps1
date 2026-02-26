# Make Something — Windows Setup
# Run with: irm https://raw.githubusercontent.com/filip-pilar/makesomething/main/scripts/setup-windows.ps1 | iex

# Allow scripts (like npm.ps1) to run in this session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

$ErrorActionPreference = "Stop"

$REPO_URL = "https://github.com/filip-pilar/makesomething.git"
$RAW_BASE_URL = "https://raw.githubusercontent.com/filip-pilar/makesomething/main"
$INSTALL_DIR = "$HOME\Desktop\make-something"

Write-Host ""
Write-Host "  ==============================" -ForegroundColor Cyan
Write-Host "     Make Something Setup" -ForegroundColor Cyan
Write-Host "  ==============================" -ForegroundColor Cyan
Write-Host ""

# --- Check for WSL ---
$wslAvailable = $false
try {
    $wslCheck = wsl --list --quiet 2>$null
    if ($LASTEXITCODE -eq 0 -and $wslCheck) {
        $wslAvailable = $true
    }
} catch {}

if ($wslAvailable) {
    Write-Host "-> Found WSL! Running setup inside Linux..."
    wsl bash -c "bash <(curl -fsSL $RAW_BASE_URL/scripts/setup-mac.sh)"
    exit
}

Write-Host "-> Running native Windows setup..."

# --- 1. Node.js ---
$nodeInstalled = $false
try {
    $nodeVersion = node -v 2>$null
    if ($nodeVersion) {
        $major = [int]($nodeVersion -replace 'v','').Split('.')[0]
        if ($major -ge 20) {
            Write-Host "[OK] Node.js $nodeVersion already installed"
            $nodeInstalled = $true
        }
    }
} catch {}

if (-not $nodeInstalled) {
    Write-Host "-> Installing Node.js..."
    try {
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
        # Refresh PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    } catch {
        Write-Host ""
        Write-Host "  Could not install Node.js automatically." -ForegroundColor Yellow
        Write-Host "  Please install it from: https://nodejs.org" -ForegroundColor Yellow
        Write-Host "  Then re-run this script." -ForegroundColor Yellow
        exit 1
    }
}

# --- 2. Codex CLI ---
$codexInstalled = $false
try {
    codex --version 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $codexInstalled = $true
    }
} catch {}

if (-not $codexInstalled) {
    Write-Host "-> Installing Codex CLI..."
    npm install -g @openai/codex
} else {
    Write-Host "-> Updating Codex CLI..."
    npm update -g @openai/codex
}

# --- Check for git ---
$gitInstalled = $false
try {
    git --version 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Git already installed"
        $gitInstalled = $true
    }
} catch {}

if (-not $gitInstalled) {
    Write-Host "-> Installing Git..."
    try {
        winget install Git.Git --accept-package-agreements --accept-source-agreements
        # Refresh PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    } catch {
        Write-Host ""
        Write-Host "  Could not install Git automatically." -ForegroundColor Yellow
        Write-Host "  Please install it from: https://git-scm.com" -ForegroundColor Yellow
        Write-Host "  Then re-run this script." -ForegroundColor Yellow
        exit 1
    }
}

# --- 3. Clone repo ---
if (Test-Path $INSTALL_DIR) {
    Write-Host "[OK] Project already exists at $INSTALL_DIR"
    Set-Location $INSTALL_DIR
    try { git pull --ff-only 2>$null } catch {}
} else {
    Write-Host "-> Downloading project..."
    git clone $REPO_URL $INSTALL_DIR
    Set-Location $INSTALL_DIR
}

# --- 4. Install dependencies ---
Write-Host "-> Installing dependencies..."
npm install

# --- 5. Start dev server ---
Write-Host "-> Starting dev server..."

# Kill any existing process on port 3000
$existing = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($existing) {
    $existing | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

try {
    $npmPath = (Get-Command npm).Source
} catch {
    Write-Host ""
    Write-Host "  npm not found in PATH. Please close and reopen PowerShell, then re-run this script." -ForegroundColor Yellow
    exit 1
}
$devProcess = Start-Process -FilePath $npmPath -ArgumentList "run","dev" -WorkingDirectory $INSTALL_DIR -PassThru -WindowStyle Hidden

try {
    # --- 6. Wait for server ---
    Write-Host "-> Waiting for your app to start..."
    $tries = 0
    $maxTries = 30
    while ($tries -lt $maxTries) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) { break }
        } catch {}
        Start-Sleep -Seconds 1
        $tries++
    }

    # --- 7. Open browser ---
    Write-Host "-> Opening browser..."
    Start-Process "http://localhost:3000"

    Write-Host ""
    Write-Host "  [OK] Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Your app is now running in the browser."
    Write-Host "  When Codex opens below, sign in with your ChatGPT account."
    Write-Host ""

    # --- 8. Launch Codex (full-auto so beginners never see approval prompts) ---
    codex --full-auto
} finally {
    # --- 9. Cleanup ---
    Write-Host ""
    Write-Host "  Stopping dev server..."
    Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue
    # Kill any remaining processes on port 3000
    $remaining = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($remaining) {
        $remaining | ForEach-Object {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}
