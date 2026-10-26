# Stage 1: Build the TanStack Start + Vite + Nitro application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies deterministically (including devDependencies required for Vite/Nitro build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source (filtered by .dockerignore)
COPY . .

# Build with Nitro node-server preset exclusively for Guara Cloud container
ENV NITRO_PRESET=node-server
RUN npm run build

# Stage 2: Production Node.js runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

# Copy only the self-contained Nitro build output and package metadata
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
