# ======================================
# Stage 1: Build & Prisma generate
# ======================================
FROM node:20-slim AS builder
WORKDIR /app

# Install system dependencies for Prisma + build
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    openssl \
 && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY package*.json ./

# Install all deps including dev
RUN npm ci

# Copy everything else
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# ======================================
# Stage 2: Production runtime
# ======================================
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Optional sanity check
RUN ls -la prisma && ls -la dist

# Run as non-root user
RUN useradd -m nodeuser
USER nodeuser

EXPOSE 8000

CMD ["node", "dist/server.js"]
