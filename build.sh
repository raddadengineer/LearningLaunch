#!/usr/bin/env bash
set -euo pipefail

# Build (and optionally push) a learninglaunch image with commit metadata baked in.
#
# Usage:
#   ./build.sh
#   IMG=raddadengineer/learninglaunch TAG=v1.2.0 ./build.sh
#   IMG=raddadengineer/learninglaunch TAG=v1.2.0 PUSH=1 ./build.sh
#   IMG=raddadengineer/learninglaunch TAG=v1.2.0 PLATFORMS=linux/amd64,linux/arm64 PUSH=1 ./build.sh
#
# For arm64 / multi-arch builds on a Mac (Intel or Apple Silicon):
#   docker buildx create --name mybuilder --use
#   docker buildx inspect --bootstrap mybuilder
#   IMG=raddadengineer/learninglaunch TAG=v1.2.0 PLATFORMS=linux/arm64 ./build.sh
#
# For multiple platforms (requires PUSH=1 — buildx cannot --load multi-arch):
#   PLATFORMS=linux/amd64,linux/arm64 PUSH=1 ./build.sh
#
# Env vars:
#   IMG        Image repo/name            (default: raddadengineer/learninglaunch)
#   TAG        Tag                        (default: v<package.json version>)
#   PUSH       1 to push after build      (default: 0)
#   PLATFORMS  Comma-separated platforms  (default: current host platform via plain docker build)
#              When set, buildx is used.  e.g. linux/amd64,linux/arm64

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

IMG="${IMG:-raddadengineer/learninglaunch}"
PUSH="${PUSH:-0}"
PLATFORMS="${PLATFORMS:-}"

# Derive TAG from package.json version if not supplied
PKG_VERSION="$(node -p "require('./package.json').version" 2>/dev/null || true)"
if [[ -z "${TAG:-}" ]]; then
  if [[ -n "$PKG_VERSION" ]]; then
    TAG="v$PKG_VERSION"
  else
    TAG="dev"
  fi
fi

# Git metadata (gracefully handled when git is unavailable)
GIT_SHA="$(git rev-parse HEAD 2>/dev/null || true)"
GIT_REF="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
GIT_COMMITTED_AT="$(git log -1 --format=%cI 2>/dev/null || true)"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "╔══════════════════════════════════════════════════════╗"
echo "║          LearningLaunch — Docker Build               ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  image:      $IMG:$TAG  (also tagged :latest)"
echo "  sha:        ${GIT_SHA:-—}"
echo "  ref:        ${GIT_REF:-—}"
echo "  committed:  ${GIT_COMMITTED_AT:-—}"
echo "  built:      $BUILD_TIME"
echo "  platforms:  ${PLATFORMS:-<host default>}"
echo "  push:       ${PUSH}"
echo ""

build_args=(
  --build-arg "LEARNINGLAUNCH_GIT_SHA=${GIT_SHA}"
  --build-arg "LEARNINGLAUNCH_GIT_REF=${GIT_REF}"
  --build-arg "LEARNINGLAUNCH_GIT_COMMITTED_AT=${GIT_COMMITTED_AT}"
  --build-arg "LEARNINGLAUNCH_BUILD_TIME=${BUILD_TIME}"
)

if [[ -n "$PLATFORMS" ]]; then
  # ── Multi-arch build via buildx ──────────────────────────────────────────────
  # A builder instance with the docker-container driver must exist.
  # If none is active, create one automatically.
  if ! docker buildx inspect learninglaunch-builder &>/dev/null; then
    echo "→ Creating buildx builder 'learninglaunch-builder'..."
    docker buildx create --name learninglaunch-builder --driver docker-container --use
    docker buildx inspect --bootstrap learninglaunch-builder
  else
    docker buildx use learninglaunch-builder
  fi

  cmd=(
    docker buildx build
    --platform "$PLATFORMS"
    "${build_args[@]}"
    -t "$IMG:$TAG"
    -t "$IMG:latest"
  )

  if [[ "$PUSH" == "1" ]]; then
    # Multi-arch images cannot be loaded locally; they must be pushed.
    cmd+=(--push)
  else
    # Single-arch buildx build: load into local Docker daemon.
    cmd+=(--load)
  fi

  cmd+=(.)
  echo "→ Running: ${cmd[*]}"
  "${cmd[@]}"

else
  # ── Single-platform build (plain docker build) ───────────────────────────────
  echo "→ Running: docker build ... -t $IMG:$TAG -t $IMG:latest ."
  docker build "${build_args[@]}" -t "$IMG:$TAG" -t "$IMG:latest" .

  if [[ "$PUSH" == "1" ]]; then
    echo "→ Pushing $IMG:$TAG ..."
    docker push "$IMG:$TAG"
    echo "→ Pushing $IMG:latest ..."
    docker push "$IMG:latest"
  fi
fi

echo ""
echo "✓ Done."
