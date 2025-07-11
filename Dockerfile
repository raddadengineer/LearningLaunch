# 🏗️ Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and clear any previous builds
COPY . .
RUN rm -rf dist

# Build client (outputs to dist/public based on vite.config.ts)
RUN npx vite build

# Build server as ESM (.mjs) — picks up latest server logic (e.g. serveStatic)
RUN npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=dist/server/index.mjs \
  --external:@neondatabase/serverless

# 🚀 Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server/db-docker.ts ./server/db-docker.ts
COPY --from=builder /app/server/db-switch.ts ./server/db-switch.ts
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder /app/package*.json ./

# Install runtime utilities
RUN npm install drizzle-kit pg @types/pg && \
    apk add --no-cache postgresql-client curl

# Enable entrypoint script
RUN chmod +x ./docker-entrypoint.sh

# Create the expected public directory structure for static files
RUN mkdir -p /app/dist/server && cp -r /app/dist/public /app/dist/server/public 2>/dev/null || echo "Static files will be created at runtime"

# Expose the application port
EXPOSE 5000

# Use entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server/index.mjs"]
