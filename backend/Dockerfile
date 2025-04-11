# Use a Node.js image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the NestJS project
RUN npm run build

# Expose the port Nest uses
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]
