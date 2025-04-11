# Use Node.js as the base image
FROM node:18 as build

# Set the working directory inside the container
WORKDIR /app

# Copy backend folder into container
COPY ./backend ./backend

# Change directory into backend
WORKDIR /app/backend

# Install dependencies
RUN npm install

# Build the NestJS project
RUN npm run build

# ---------------------------

# Start a new container with just the built app
FROM node:18

# Set working directory
WORKDIR /app

# Copy built files from previous stage
COPY --from=build /app/backend /app

# Install only production deps
RUN npm install --only=production

# Set environment variables (optional)
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main"]
