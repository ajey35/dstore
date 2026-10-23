#!/usr/bin/env bash

set -Eeuo pipefail

MODE="all"
LOG_DIR="${LOG_DIR:-/tmp/archivist-setup-logs}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="${LOG_DIR}/archivist-linux-${TIMESTAMP}.log"
START_STEP=""
LAST_OUTPUT=""

usage() {
  cat <<'EOF'
Usage: bash scripts/setup-archivist-linux.sh [--webui-only] [--skip-system] [--skip-sidecar]

Options:
  --webui-only   Install and build the WebUI only.
  --skip-system  Do not install apt packages or inspect system dependencies.
  --skip-sidecar Skip downloading the Archivist sidecar binary.
  -h, --help     Show this help.

Logs are written to: /tmp/archivist-setup-logs/archivist-linux-<timestamp>.log
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --webui-only) MODE="webui" ;;
    --skip-system) SKIP_SYSTEM=1 ;;
    --skip-sidecar) SKIP_SIDECAR=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
  shift
done

mkdir -p "$LOG_DIR"
touch "$LOG_FILE"
exec 3>>"$LOG_FILE"

log() {
  local message="$*"
  local entry
  entry="[$(date '+%Y-%m-%d %H:%M:%S')] $message"
  printf '%s\n' "$entry" >&2
  printf '%s\n' "$entry" >&3
}

run_step() {
  START_STEP="$1"
  shift
  log "STEP: $START_STEP"

  set +e
  LAST_OUTPUT="$("$@" 2>&1)"
  local status=$?
  set -e

  if [[ -n "$LAST_OUTPUT" ]]; then
    printf '%s\n' "$LAST_OUTPUT" | tee -a "$LOG_FILE" >&3
  fi

  if [[ $status -ne 0 ]]; then
    return "$status"
  fi
}

on_error() {
  local status=$?
  local failed_line=${BASH_LINENO[0]:-unknown}

  log "FAILED: ${START_STEP:-initialization}"
  log "Exit code: $status"
  log "Script line: $failed_line"
  if [[ -n "$LAST_OUTPUT" ]]; then
    log "Last command output:"
    printf '%s\n' "$LAST_OUTPUT" >&2
  fi
  log "Full diagnostic log: $LOG_FILE"
  exit "$status"
}
trap on_error ERR

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Missing required command: $1"
    log "Install hint: $2"
    return 1
  fi
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

log "Archivist Linux setup started"
log "Project: $PROJECT_ROOT"
log "Mode: $MODE"
log "Log: $LOG_FILE"

if [[ $(uname -s) != "Linux" ]]; then
  log "This script only supports Linux."
  exit 1
fi

if [[ ${SKIP_SYSTEM:-0} -ne 1 && $MODE == "all" ]]; then
  run_step "Install Linux build dependencies" sudo apt-get update
  run_step "Install Linux build dependencies" sudo apt-get install -y \
    build-essential curl wget git unzip pkg-config libssl-dev \
    libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev gh
fi

if [[ $MODE == "all" ]]; then
  if ! command -v node >/dev/null 2>&1; then
    run_step "Install Node.js 20 repository" bash -c \
      'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -'
    run_step "Install Node.js 20" sudo apt-get install -y nodejs
  fi

  require_command node "Install Node.js 20 or newer"
  require_command curl "sudo apt-get install curl"

  run_step "Verify Node.js major version" node -e \
    'const major=Number(process.versions.node.split(".")[0]); if (major < 20) throw new Error(`Node.js ${major} is too old; use Node.js 20+`);'

  if ! command -v pnpm >/dev/null 2>&1; then
    run_step "Install pnpm 10" npm install -g pnpm@10.26.0
  fi
  require_command pnpm "npm install -g pnpm@10.26.0"

  if ! command -v cargo >/dev/null 2>&1; then
    run_step "Install Rust stable" bash -c \
      'curl --proto '=\"'\"'https'=\"'\"' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y'
    export PATH="$HOME/.cargo/bin:$PATH"
  fi
  require_command cargo "Install Rust with rustup"

  run_step "Install Rust stable toolchain" rustup default stable
  run_step "Install project npm dependencies" pnpm install --frozen-lockfile
fi

run_step "Install WebUI dependencies" pnpm --dir webui install --frozen-lockfile

cat > webui/.env.local <<'EOF'
VITE_API_URL=/api/archivist/v1
EOF
log "Configured WebUI development API: /api/archivist/v1"

run_step "Build WebUI" pnpm --dir webui build
run_step "Verify WebUI build output" test -f webui/dist/index.html

if [[ $MODE == "all" && ${SKIP_SIDECAR:-0} -ne 1 ]]; then
  require_command gh "sudo apt-get install gh; then run gh auth login"

  if ! gh auth status >/dev/null 2>&1; then
    log "GitHub CLI is not authenticated. Run: gh auth login"
    log "Then rerun this script or use --skip-sidecar"
    exit 1
  fi

  run_step "Download pinned Archivist sidecar" pnpm download-sidecar
fi

if curl --fail --silent --show-error \
  --connect-timeout 5 \
  http://127.0.0.1:8080/api/archivist/v1/debug/info \
  >/dev/null 2>&1; then
  log "Runtime check: Archivist node API is reachable on port 8080"
else
  log "Runtime check: node API is not reachable yet"
  log "Start it with: pnpm tauri dev"
  log "Or start the downloaded sidecar, then run: curl http://127.0.0.1:8080/api/archivist/v1/debug/info"
fi

log "SUCCESS: setup completed"
log "Web UI build: $PROJECT_ROOT/webui/dist"
log "Full log: $LOG_FILE"
printf '\nNext steps:\n'
printf '  1. Start the desktop app: pnpm tauri dev\n'
printf '     OR start the sidecar manually and keep it running.\n'
printf '  2. Start the Web UI: cd webui && pnpm dev --host 0.0.0.0 --port 3000\n'
printf '  3. Open: http://localhost:3000\n'
printf '  4. Logs: %s\n' "$LOG_FILE"
