# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build the client
COPY . .
RUN npx vite build

# Build the server output as ESM (.mjs)
RUN npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=dist/server/index.mjs \
  --external:@neondatabase/serverless

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install only production dependencies
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

# Install runtime dependencies
RUN npm install drizzle-kit pg @types/pg && \
    apk add --no-cache postgresql-client curl

# Enable entrypoint
RUN chmod +x ./docker-entrypoint.sh

# Enable non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Set up environment for ESM
ENV NODE_OPTIONS=--experimental-specifier-resolution=node

# Entrypoint and start command using .mjs
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server/index.mjs"]
