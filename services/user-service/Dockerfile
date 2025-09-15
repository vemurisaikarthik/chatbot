# Stage 1: Build
FROM node:24-alpine3.21 AS builder

WORKDIR /app

# Copy package files and install all deps (including dev for build)
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:24-alpine3.21

WORKDIR /app

# Copy package files and install only production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy built dist and healthcheck script from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/healthcheck.js ./healthcheck.js

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the app
CMD ["npm", "run", "start:prod"]