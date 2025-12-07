#!/bin/bash
# Geetanjali Production Deployment Script
# Usage: ./scripts/deploy.sh [--clean]

set -e

# Configuration
REMOTE_USER="gitam"
REMOTE_HOST="64.227.133.142"
REMOTE_DIR="/opt/geetanjali"
SSH_CMD="ssh ${REMOTE_USER}@${REMOTE_HOST}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Parse arguments
CLEAN_DOCKER=false
for arg in "$@"; do
    case $arg in
        --clean) CLEAN_DOCKER=true ;;
    esac
done

# Step 1: Push local changes
log "Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    error "Uncommitted changes detected. Please commit or stash before deploying."
fi

log "Pushing to origin..."
git push origin main || error "Failed to push to origin"

# Step 2: Pull on remote
log "Pulling changes on server..."
$SSH_CMD "cd ${REMOTE_DIR} && git pull origin main" || error "Failed to pull on server"

# Step 3: Docker cleanup (optional but recommended)
if [[ "$CLEAN_DOCKER" == "true" ]]; then
    log "Cleaning up Docker (build cache and unused images)..."
    $SSH_CMD "docker builder prune -f && docker image prune -f" || warn "Docker cleanup had warnings"
else
    # Always clean build cache (it grows fast)
    log "Cleaning Docker build cache..."
    $SSH_CMD "docker builder prune -f" || warn "Build cache cleanup had warnings"
fi

# Step 4: Rebuild and restart containers
log "Rebuilding and restarting containers..."
$SSH_CMD "cd ${REMOTE_DIR} && docker compose build && docker compose up -d" || error "Failed to restart containers"

# Step 5: Wait for health checks
log "Waiting for services to become healthy..."
sleep 10

# Step 6: Verify deployment
log "Verifying deployment..."
$SSH_CMD "docker ps --format 'table {{.Names}}\t{{.Status}}'"

# Step 7: Quick health check
HEALTH_STATUS=$($SSH_CMD "curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/health")
if [[ "$HEALTH_STATUS" == "200" ]]; then
    log "Backend health check: ${GREEN}OK${NC}"
else
    warn "Backend health check returned: $HEALTH_STATUS"
fi

# Step 8: Show disk usage
log "Disk usage after deployment:"
$SSH_CMD "df -h / | tail -1"

echo ""
log "${GREEN}Deployment complete!${NC}"
echo ""
echo "  Site: https://geetanjaliapp.com"
echo "  API:  https://geetanjaliapp.com/api/v1/health"
echo ""
