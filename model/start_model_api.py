#!/usr/bin/env python3
"""
Start the AI Companion Model API
This script starts the FastAPI server for your custom LangGraph model
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False
    return True

def start_api():
    """Start the FastAPI server"""
    print("Starting AI Companion Model API...")
    print("Model: TinyLlama-1.1B-Chat-v1.0")
    print("API will be available at: http://localhost:8000")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        subprocess.run([sys.executable, "api_wrapper.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    print("🤖 AI Companion Model API Setup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists("api_wrapper.py"):
        print("❌ Error: api_wrapper.py not found!")
        print("Please run this script from the model/ directory")
        sys.exit(1)
    
    # Install dependencies
    if install_requirements():
        # Start the API
        start_api()
    else:
        print("❌ Failed to install dependencies. Please check your Python environment.")
        sys.exit(1)

