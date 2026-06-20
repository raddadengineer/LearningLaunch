#!/bin/sh
set -e

BUILDER_NAME="${DOCKER_BUILDX_BUILDER:-learninglaunch-builder}"

if ! docker buildx inspect "$BUILDER_NAME" >/dev/null 2>&1; then
  echo "Creating buildx builder: $BUILDER_NAME"
  docker buildx create --name "$BUILDER_NAME" --driver docker-container --use
  docker buildx inspect --bootstrap
else
  docker buildx use "$BUILDER_NAME"
fi

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t raddadengineer/learninglaunch:latest \
  --push \
  .
