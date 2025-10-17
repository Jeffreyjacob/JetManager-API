# Stage 1: Install dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit-dev

# Stage 2: Build and generate Prisma client
FROM node:20-slim AS builder
WORKDIR /app

# Install build tools + OpenSSL for Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code + prisma folder
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 3: Production runner
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules + built dist + package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY prisma ./prisma    

RUN chown -R node:node /app
USER node

EXPOSE 8000

# Run backend server
CMD ["node", "dist/server.js"]
