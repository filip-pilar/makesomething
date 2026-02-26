#!/usr/bin/env bash
# Make Something — macOS / Linux / WSL Setup
# Run with: bash <(curl -fsSL https://raw.githubusercontent.com/filip-pilar/makesomething/main/scripts/setup-mac.sh)
#
# Idempotent — safe to run multiple times.

set -e

REPO_URL="https://github.com/filip-pilar/makesomething.git"
INSTALL_DIR="$HOME/Desktop/make-something"

echo ""
echo "  ╔══════════════════════════════════╗"
echo "  ║       Make Something Setup       ║"
echo "  ╚══════════════════════════════════╝"
echo ""

# --- 1. Homebrew ---
if ! command -v brew &>/dev/null; then
  echo "→ Installing Homebrew (you may need to enter your Mac password)..."
  echo "  This also installs Xcode Command Line Tools — can take 5-10 min. Hang tight!"
  sudo -v
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Add brew to PATH for Apple Silicon, Intel, or Linux
  if [[ -f /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -f /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  elif [[ -f /home/linuxbrew/.linuxbrew/bin/brew ]]; then
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
  fi

  # Persist brew to shell profile
  SHELL_PROFILE="$HOME/.zshrc"
  if [[ "$SHELL" == */bash ]] && [[ -f "$HOME/.bash_profile" ]]; then
    SHELL_PROFILE="$HOME/.bash_profile"
  fi
  if ! grep -q 'brew shellenv' "$SHELL_PROFILE" 2>/dev/null; then
    if [[ -f /opt/homebrew/bin/brew ]]; then
      echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> "$SHELL_PROFILE"
    elif [[ -f /usr/local/bin/brew ]]; then
      echo 'eval "$(/usr/local/bin/brew shellenv)"' >> "$SHELL_PROFILE"
    elif [[ -f /home/linuxbrew/.linuxbrew/bin/brew ]]; then
      echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> "$SHELL_PROFILE"
    fi
  fi
else
  echo "✓ Homebrew already installed"
fi

# --- 2. Node.js 20+ ---
install_node() {
  echo "→ Installing Node.js..."
  brew install node
}

if ! command -v node &>/dev/null; then
  install_node
else
  NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
  if [[ "$NODE_MAJOR" -lt 20 ]]; then
    echo "→ Node.js is too old ($(node -v)), upgrading..."
    brew upgrade node 2>/dev/null || brew install node
  else
    echo "✓ Node.js $(node -v) already installed"
  fi
fi

# --- 3. Codex CLI ---
if ! command -v codex &>/dev/null; then
  echo "→ Installing Codex CLI..."
  npm install -g @openai/codex
else
  echo "→ Updating Codex CLI..."
  npm update -g @openai/codex
fi

# --- 4. Git ---
if ! command -v git &>/dev/null; then
  echo "→ Installing git..."
  brew install git
fi

# --- 5. Clone repo ---
if [[ -d "$INSTALL_DIR" ]]; then
  echo "✓ Project already exists at $INSTALL_DIR"
  cd "$INSTALL_DIR"
  git pull --ff-only 2>/dev/null || true
  chmod +x run.command
else
  echo "→ Downloading project..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  chmod +x run.command
fi

# --- 6. Install dependencies ---
# Fix npm cache ownership if a previous sudo install broke it
if [[ -d "$HOME/.npm" ]]; then
  sudo chown -R "$(whoami)" "$HOME/.npm"
fi
echo "→ Installing dependencies..."
npm install

# --- 7. Start dev server in background ---
echo "→ Starting dev server..."

# Kill any existing process on port 3000 (safe for target audience; unlikely to conflict)
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true

npm run dev > /dev/null &
DEV_PID=$!
trap 'echo ""; echo "  Stopping dev server..."; kill $DEV_PID 2>/dev/null || true; lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true' EXIT

# --- 8. Wait for server to be ready ---
echo "→ Waiting for your app to start..."
TRIES=0
MAX_TRIES=30
while ! curl -s -o /dev/null http://localhost:3000 2>/dev/null; do
  sleep 1
  TRIES=$((TRIES + 1))
  if [[ $TRIES -ge $MAX_TRIES ]]; then
    echo "⚠ Dev server took too long to start. Open the make-something folder on your Desktop and double-click run.command"
    break
  fi
done

# --- 9. Open browser ---
echo "→ Opening browser..."
if grep -qi microsoft /proc/version 2>/dev/null; then
  cmd.exe /c start http://localhost:3000 2>/dev/null || true
elif command -v open &>/dev/null; then
  open http://localhost:3000
elif command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:3000
fi

echo ""
echo "  ✓ Setup complete!"
echo ""
echo "  Your app is now running in the browser."
echo "  When Codex opens below, sign in with your ChatGPT account."
echo ""

# --- 10. Launch Codex (full-auto so beginners never see approval prompts) ---
codex --full-auto

