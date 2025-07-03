#!/bin/bash

# SportTrack.ai Startup Script
echo "🏃‍♂️ Starting SportTrack.ai..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the application
echo "🚀 Launching SportTrack.ai on http://localhost:8000"
echo "Upload your sports video and get AI-powered pose analysis!"
echo "Press Ctrl+C to stop the server"
echo ""

python3 app.py