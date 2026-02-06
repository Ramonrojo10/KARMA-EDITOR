# KARMA OPS EDITOR - Production Dockerfile
# Build stage for frontend and backend dependencies

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for both frontend and backend
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm ci --legacy-peer-deps
RUN cd backend && npm ci

# Copy source files
COPY frontend ./frontend
COPY backend ./backend

# Build frontend
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY --from=builder /app/backend/src ./backend/src

# Copy built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Create upload directory
RUN mkdir -p /tmp/uploads && chmod 777 /tmp/uploads

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start the server
CMD ["node", "src/index.js"]
