# syntax=docker.io/docker/dockerfile:1

# Accept version as build argument
ARG VERSION=dev

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci


# Rebuild the source code only when needed
FROM base AS builder

# Re-declare version argument for this stage (needed to access global ARG)
ARG VERSION=dev

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Update version.ts with the build argument
RUN echo "export const VERSION = \"${VERSION}\";" > src/lib/version.ts

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Set Node.js memory limit for build
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build the application
RUN npm run build

# Verify the build was successful
RUN ls -la .next/ || (echo "Build failed - .next directory not found" && exit 1)

# Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
# Disable telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED=1


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]