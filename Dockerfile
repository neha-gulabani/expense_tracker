# Build stage
FROM node:18 as builder

# Set working directory
WORKDIR /app

# Copy backend folder
COPY ./backend ./backend

# Move into backend directory
WORKDIR /app/backend

# Install dependencies
RUN npm install

# Build the app
RUN npm run build

# =============================

# Production stage
FROM node:18

WORKDIR /app

# Copy only built files and node_modules from builder
COPY --from=builder /app/backend /app

# Install only production dependencies
RUN npm install --omit=dev

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "dist/main"]
