# ── Stage 1: Build ──────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency descriptors
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: Runtime ───────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependency descriptors and install production deps only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client for production
COPY prisma ./prisma
RUN npx prisma generate

# Copy compiled JavaScript from build stage
COPY --from=build /app/dist ./dist

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
