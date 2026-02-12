# Stage 1: Build stage
FROM node:24.13.1-alpine AS builder

WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy root package files and turbo config
COPY package.json package-lock.json turbo.json ./

# Copy all package.json files for better dependency resolution
COPY apps/nextjs-frontend/package.json ./apps/nextjs-frontend/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN npm ci

# Copy the shared package source code
COPY packages/shared/ ./packages/shared/

# Copy the nextjs-frontend source code
COPY apps/nextjs-frontend/ ./apps/nextjs-frontend/

# Build the shared package first, then the nextjs-frontend
# Turbo will handle the dependency order automatically
RUN turbo run build --filter=nextjs-frontend...

# Stage 2: Production image
FROM node:24.13.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary production files
COPY --from=builder /app/apps/nextjs-frontend/package.json ./
COPY --from=builder /app/apps/nextjs-frontend/.next ./.next
COPY --from=builder /app/apps/nextjs-frontend/public ./public
COPY --from=builder /app/apps/nextjs-frontend/next.config.ts ./

# Copy built shared package if needed at runtime
COPY --from=builder /app/packages/shared/dist ./node_modules/@next-nest-turbo-auth-boilerplate/shared/dist

# Only copy dependencies needed for production
# This is more efficient than copying all node_modules
RUN npm install --production

# Default Port
ENV PORT=3000
EXPOSE $PORT

CMD ["node_modules/.bin/next", "start"]