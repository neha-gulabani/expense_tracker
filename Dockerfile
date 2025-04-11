# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY ./backend ./backend
WORKDIR /app/backend
RUN npm install
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main.js"]
