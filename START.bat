@echo off
REM ============================================
REM SLIIT Eats - Start All Services
REM ============================================
REM This batch file starts all 3 applications
REM Make sure you have 3 terminals open

echo.
echo ========================================
echo   SLIIT Eats - Complete Startup Guide
echo ========================================
echo.
echo This project has 3 separate applications:
echo.
echo 1. BACKEND SERVER (Node.js + Express)
echo    Command: cd server && npm start
echo    Port: http://localhost:3000
echo.
echo 2. WEB APP (Next.js + React)
echo    Command: cd client && npm run dev
echo    Port: http://localhost:3000 (or 3001)
echo.
echo 3. MOBILE APP (React Native + Expo)
echo    Command: cd public/react-native-screens && npx expo start
echo    Port: http://localhost:19000
echo.
echo ========================================
echo   STARTUP INSTRUCTIONS
echo ========================================
echo.
echo STEP 1: Open Terminal 1 and run:
echo   cd server
echo   npm install   (first time only)
echo   npm start
echo.
echo STEP 2: Open Terminal 2 and run:
echo   cd client
echo   npm install   (first time only)
echo   npm run dev
echo.
echo STEP 3: Open Terminal 3 and run:
echo   cd public/react-native-screens
echo   npm install   (first time only)
echo   npx expo start
echo.
echo ========================================
echo   TESTING
echo ========================================
echo.
echo Web App:     http://localhost:3000
echo Mobile App:  Scan QR code in Terminal 3
echo API:         curl http://localhost:3000/foodItem
echo.
echo Press any key to continue...
pause
