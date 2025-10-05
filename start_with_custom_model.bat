@echo off
echo 🤖 Starting AI Video Call App with Custom Model
echo ================================================

echo.
echo Step 1: Starting your custom LangGraph model API...
echo.
cd model
start "Model API" cmd /k "python start_model_api.py"
cd ..

echo.
echo Step 2: Waiting for model API to start (10 seconds)...
timeout /t 10 /nobreak > nul

echo.
echo Step 3: Starting Next.js development server...
echo.
start "Next.js App" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 📱 Next.js App: http://localhost:3000
echo 🤖 Model API: http://localhost:8000
echo.
echo 🎯 To test:
echo 1. Open http://localhost:3000
echo 2. Select a companion (Luna, Rex, or Nova)
echo 3. Join a video room
echo 4. Click the chat button (💬) to talk with your AI model!
echo.
echo Press any key to exit this window...
pause > nul

