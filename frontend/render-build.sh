#!/usr/bin/env bash
set -euo pipefail

# Ensure Bun is available
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Print Bun version for sanity
bun --version

# Install dependencies at the root (monorepo aware)
bun install --frozen-lockfile

# Build frontend
cd frontend
bun install --frozen-lockfile
bun run build

