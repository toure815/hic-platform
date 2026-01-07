#!/usr/bin/env bash
set -euo pipefail

# ---- config ----
: "${GITHUB_TOKEN:?Set GITHUB_TOKEN in your environment first}"
REPO="toure815/hic-platform"
BRANCH="main"
BACKUP_BRANCH="main-backup-before-force"
COMMIT_MSG="${COMMIT_MSG:-chore: sync Leap state to GitHub}"

# ---- git identity ----
git config user.name "leap-authoritative-sync"
git config user.email "noreply@leap.local"

# ---- make sure we're on main ----
git checkout -B "$BRANCH"

# ---- commit changes if any ----
git add -A
if git diff-index --quiet HEAD --; then
  echo "No changes to commit."
else
  git commit -m "$COMMIT_MSG"
fi

# ---- set authenticated remote ----
git remote remove origin 2>/dev/null || true
git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git"

# ---- backup current remote main ----
git fetch origin "$BRANCH" || true
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  git push origin "refs/heads/${BRANCH}:refs/heads/${BACKUP_BRANCH}"
  echo "Backup branch updated: ${BACKUP_BRANCH}"
else
  echo "Remote main not found; pushing HEAD as backup branch."
  git push origin "HEAD:refs/heads/${BACKUP_BRANCH}"
fi

# ---- safe push (no force needed unless diverged) ----
echo "Pushing to origin/${BRANCH}..."
if git push origin "$BRANCH"; then
  echo "Normal push succeeded."
else
  echo "Normal push failed. Attempting safe force-with-lease..."
  git fetch origin "$BRANCH" || true
  expected_sha="$(git rev-parse "origin/${BRANCH}" || echo "")"
  if [ -n "$expected_sha" ]; then
    git push --force-with-lease=refs/heads/${BRANCH}:${expected_sha} origin "$BRANCH"
  else
    git push --force-with-lease origin "$BRANCH"
  fi
fi

# ---- verify ----
git fetch origin "$BRANCH"
local_sha="$(git rev-parse HEAD)"
remote_sha="$(git rev-parse origin/${BRANCH})"
echo "Local:  $local_sha"
echo "Remote: $remote_sha"

if [ "$local_sha" = "$remote_sha" ]; then
  echo "✅ SUCCESS: GitHub is synced. Render should auto-deploy."
else
  echo "❌ ERROR: GitHub did not match local."
  exit 1
fi

