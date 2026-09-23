# ==========================================
# Stage 1: Build & Dependencies
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies cleanly
RUN npm ci --only=production && npm cache clean --force

# ==========================================
# Stage 2: Minimal Hardened Production Runtime
# ==========================================
FROM node:20-alpine AS runner

# Add dumb-init for proper signal forwarding and zombie process reaping in K8s
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Security Hardening: Run as unprivileged non-root 'node' user
USER node

# Copy dependencies and source code with proper ownership
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ ./src/

# Expose microservice port
EXPOSE 5000

# Container Healthcheck (Docker runtime check)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/live || exit 1

# Launch with dumb-init for graceful shutdown signal propagation (SIGTERM)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
