#!/usr/bin/env bash
set -euo pipefail

: "${LEAP_GITHUB_TOKEN:?LEAP_GITHUB_TOKEN must be set}"

GIT_COMMIT_MESSAGE="${GIT_COMMIT_MESSAGE:-chore: establish authoritative sync between Leap, GitHub, and production frontend}"
REPO="toure815/hic-platform"
TARGET_BRANCH="main"
BACKUP_BRANCH="main-backup-before-force"

#!/usr/bin/env bash
set -euo pipefail

: "${LEAP_GITHUB_TOKEN:?LEAP_GITHUB_TOKEN must be set}"

GIT_COMMIT_MESSAGE="${GIT_COMMIT_MESSAGE:-chore: establish authoritative sync between Leap, GitHub, and production frontend}"
REPO="toure815/hic-platform"
TARGET_BRANCH="main"
BACKUP_BRANCH="main-backup-before-force"

echo "Configuring git user..."
git config user.name "leap-authoritative-sync"
git config user.email "noreply@leap.local"

echo "Ensuring branch ${TARGET_BRANCH}..."
git checkout -B "${TARGET_BRANCH}"

echo "Creating commit if needed..."
git add -A
if git diff-index --quiet HEAD --; then
  echo "No changes to commit."
else
  git commit -m "${GIT_COMMIT_MESSAGE}"
fi

echo "Configuring authenticated remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://x-access-token:${LEAP_GITHUB_TOKEN}@github.com/${REPO}.git"

echo "Fetching remote main..."
git fetch origin "${TARGET_BRANCH}" || true

echo "Creating backup branch ${BACKUP_BRANCH}..."
if git ls-remote --exit-code --heads origin "${TARGET_BRANCH}" >/dev/null 2>&1; then
  git push origin "refs/heads/${TARGET_BRANCH}:refs/heads/${BACKUP_BRANCH}"
else
  git push origin HEAD:refs/heads/"${BACKUP_BRANCH}"
fi

echo "Calculating expected SHA..."
EXPECTED_SHA=""
if git rev-parse --verify "origin/${TARGET_BRANCH}" >/dev/null 2>&1; then
  EXPECTED_SHA=$(git rev-parse "origin/${TARGET_BRANCH}")
  echo "Expected origin/${TARGET_BRANCH} SHA: ${EXPECTED_SHA}"
fi

echo "Force pushing with lease..."
if [ -z "${EXPECTED_SHA}" ]; then
  git push --force-with-lease origin "${TARGET_BRANCH}"
else
  git push --force-with-lease=refs/heads/${TARGET_BRANCH}:${EXPECTED_SHA} origin "${TARGET_BRANCH}"
fi

echo "Verifying sync..."
git fetch origin "${TARGET_BRANCH}"
LOCAL_SHA=$(git rev-parse HEAD)
REMOTE_SHA=$(git rev-parse "origin/${TARGET_BRANCH}")

echo "Local SHA : ${LOCAL_SHA}"
echo "Remote SHA: ${REMOTE_SHA}"

if [ "${LOCAL_SHA}" = "${REMOTE_SHA}" ]; then
  echo "SUCCESS: GitHub main now matches local state."
  echo "Commits: https://github.com/${REPO}/commits/${TARGET_BRANCH}"
else
  echo "ERROR: Remote does not match local."
  exit 1
fi

