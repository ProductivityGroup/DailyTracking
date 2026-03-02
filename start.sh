#!/bin/bash

# start.sh - Run both frontend and backend development servers concurrently

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting backend server...${NC}"
cd server
npm run dev &
BACKEND_PID=$!
cd ..

echo -e "${BLUE}Starting frontend server...${NC}"
npm run dev &
FRONTEND_PID=$!

# Handle shutdown smoothly
cleanup() {
  echo ""
  echo -e "${GREEN}Shutting down backend (PID: $BACKEND_PID)...${NC}"
  kill $BACKEND_PID
  echo -e "${BLUE}Shutting down frontend (PID: $FRONTEND_PID)...${NC}"
  kill $FRONTEND_PID
  exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "Press Ctrl+C to stop both servers."

# Wait for background processes to keep script running
wait $BACKEND_PID $FRONTEND_PID
