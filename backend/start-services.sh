#!/bin/bash

# Kill any existing processes on port 3000 and 3001
echo "Stopping any existing services..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Export environment variables
export RABBITMQ_URL="amqps://xtqxihos:aiZsb2MYM9JO8GQBs9O9OgrDX_zOWamT@chameleon.lmq.cloudamqp.com/xtqxihos"

# Start the microservice in the background
echo "Starting the reports microservice..."
PORT=3001 npm run start:microservice &
MICROSERVICE_PID=$!

# Wait a moment for the microservice to start
sleep 2

# Start the main application
echo "Starting the main application..."
PORT=3000 npm run start

# If the main application exits, kill the microservice
kill $MICROSERVICE_PID 2>/dev/null
