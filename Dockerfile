# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY ./backend ./backend
WORKDIR /app/backend
RUN npm install
RUN npm run build

# Optional: DEBUG check build output (remove in prod)
RUN echo "Build output files:" && ls -R dist

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy dist + package.json + node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules

EXPOSE 3000


CMD ["node", "dist/src/main.js"]

