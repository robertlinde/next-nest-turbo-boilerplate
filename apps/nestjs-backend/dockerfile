# Stage 1: Build stage
FROM node:24.13.1-alpine AS builder

WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy root package files and turbo config
COPY package.json package-lock.json turbo.json ./

# Copy all package.json files for better dependency resolution
COPY apps/nestjs-backend/package.json ./apps/nestjs-backend/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN npm ci

# Copy the shared package source code
COPY packages/shared/ ./packages/shared/

# Copy the nestjs-backend source code
COPY apps/nestjs-backend/ ./apps/nestjs-backend/

# Build the shared package first, then the nestjs-backend
# Turbo will handle the dependency order automatically
RUN turbo run build --filter=nestjs-backend...

# Stage 2: Production image
FROM node:24.13.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json for production dependencies
COPY --from=builder /app/apps/nestjs-backend/package.json ./

# Copy the built application from builder stage
COPY --from=builder /app/apps/nestjs-backend/dist ./dist

# Copy built shared package if needed at runtime
COPY --from=builder /app/packages/shared/dist ./node_modules/@next-nest-turbo-auth-boilerplate/shared/dist

# Only copy dependencies needed for production
RUN npm install --production

# Default Port
ENV PORT=4000
EXPOSE $PORT

CMD ["node", "dist/src/main"]