# =========================
# Stage 1: Dependencies (prod + dev)
# =========================
FROM node:20-slim AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install prod dependencies (will copy dev deps in builder)
RUN npm ci --omit=dev

# =========================
# Stage 2: Builder (compile TypeScript)
# =========================
FROM node:20-slim AS builder
WORKDIR /app

# Install system deps for building
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install all dependencies (including dev for TS build)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy all source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# =========================
# Stage 3: Runner (production image)
# =========================
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy compiled JS from builder stage
COPY --from=builder /app/dist ./dist

# Copy package.json (optional)
COPY package.json ./

# Ensure proper permissions
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 8000

# Run backend server
CMD ["node", "dist/src/server.js"]
