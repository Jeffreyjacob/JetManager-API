# Dev stage
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./

RUN npm ci --omit-dev


FROM node:20-slim AS builder 
WORKDIR /app


RUN apt-get update && apt-get install -y --no-install-recommends \
   python3 \
   build-essential \
   && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm ci

# copy the rest of the source code and run the typescript build
COPY . .

# ✅ Generate Prisma client before building
RUN npx prisma generate

RUN npm run build


FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

#Copy production node_modules and build dist from earlier stages

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

RUN chown -R node:node /app

USER node

EXPOSE 8000

CMD [ "node","dist/server.js" ]
