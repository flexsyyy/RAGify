@echo off
echo ===============================================================================
echo 🚀 RAGIFY FRONTEND - GIT COMMIT SCRIPT 🚀
echo ===============================================================================
echo.

echo 📋 This script will commit your optimized RAGify frontend to GitHub
echo.
echo Frontend Features:
echo ✅ React + Next.js 15 with Turbopack
echo ✅ Tailwind CSS + shadcn/ui components
echo ✅ File upload with drag & drop
echo ✅ Handwriting recognition toggle
echo ✅ Real-time status monitoring
echo ✅ Beautiful formatted responses
echo ✅ Reset database functionality
echo ✅ Responsive design
echo.

pause

echo ===============================================================================
echo STEP 1: Navigate to Frontend Directory
echo ===============================================================================

cd /d "C:\Users\admin\Documents\ragify\ragify-frontend\ragify-working"
if %errorlevel% neq 0 (
    echo ❌ Error: Could not navigate to frontend directory
    pause
    exit /b 1
)
echo ✅ In frontend directory: ragify-working

echo.
echo ===============================================================================
echo STEP 2: Initialize Git (if needed)
echo ===============================================================================

git init
echo ✅ Git initialized

echo.
echo ===============================================================================
echo STEP 3: Configure Git User
echo ===============================================================================

git config user.name "flexsyyy"
git config user.email "flexsyyy@github.com"
echo ✅ Git user configured

echo.
echo ===============================================================================
echo STEP 4: Create .gitignore for Frontend
echo ===============================================================================

echo # Dependencies > .gitignore
echo node_modules/ >> .gitignore
echo npm-debug.log* >> .gitignore
echo yarn-debug.log* >> .gitignore
echo yarn-error.log* >> .gitignore
echo.
echo # Next.js >> .gitignore
echo .next/ >> .gitignore
echo out/ >> .gitignore
echo build/ >> .gitignore
echo.
echo # Environment >> .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo .env.development.local >> .gitignore
echo .env.test.local >> .gitignore
echo .env.production.local >> .gitignore
echo.
echo # IDE >> .gitignore
echo .vscode/ >> .gitignore
echo .idea/ >> .gitignore
echo *.swp >> .gitignore
echo *.swo >> .gitignore
echo.
echo # OS >> .gitignore
echo .DS_Store >> .gitignore
echo Thumbs.db >> .gitignore

echo ✅ Frontend .gitignore created

echo.
echo ===============================================================================
echo STEP 5: Create Frontend Optimizations Branch
echo ===============================================================================

git checkout -b frontend-optimizations
if %errorlevel% neq 0 (
    echo ⚠️ Branch might already exist, switching to it...
    git checkout frontend-optimizations
)
echo ✅ On frontend-optimizations branch

echo.
echo ===============================================================================
echo STEP 6: Add All Frontend Files
echo ===============================================================================

git add .
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to add files
    pause
    exit /b 1
)
echo ✅ All frontend files added

echo.
echo ===============================================================================
echo STEP 7: Commit Frontend Changes
echo ===============================================================================

git commit -m "🎨 RAGify Frontend - React + Next.js Implementation

✅ FRONTEND FEATURES:

🚀 Modern Tech Stack:
- Next.js 15 with Turbopack for ultra-fast development
- React 18 with TypeScript for type safety
- Tailwind CSS for responsive styling
- shadcn/ui components for beautiful UI

📁 File Management:
- Drag & drop file upload interface
- Multiple file selection support
- Real-time upload progress
- File type validation (PDF, TXT)

🖋️ Handwriting Recognition:
- Toggle switch for handwriting OCR
- Visual feedback when enabled
- Optimized for Intel UHD 620 performance

📊 Status & Monitoring:
- Real-time database status display
- Document count tracking
- Processing status indicators
- Error handling with user feedback

🗑️ Database Management:
- One-click database reset functionality
- Confirmation dialogs for safety
- Status updates after reset

💬 Query Interface:
- Clean question input field
- Formatted response display
- Loading states and animations
- Beautiful typography and spacing

🎨 UI/UX Enhancements:
- Responsive design for all screen sizes
- Dark/light theme support
- Smooth animations and transitions
- Accessible components (ARIA labels)
- Professional color scheme

⚡ Performance Optimizations:
- Optimized bundle size
- Fast refresh during development
- Efficient re-rendering with React.memo
- Lazy loading for better performance

🔧 Developer Experience:
- TypeScript for better code quality
- ESLint configuration
- Hot reload for instant feedback
- Component-based architecture

🌐 API Integration:
- RESTful API communication
- Proper error handling
- Loading states management
- CORS configuration

This frontend provides a modern, fast, and user-friendly interface for the RAGify application with all optimizations implemented for Intel UHD 620 performance."

if %errorlevel% neq 0 (
    echo ❌ Error: Failed to commit
    pause
    exit /b 1
)
echo ✅ Frontend changes committed successfully

echo.
echo ===============================================================================
echo STEP 8: Add GitHub Remote
echo ===============================================================================

git remote add origin https://github.com/flexsyyy/RAGify.git
if %errorlevel% neq 0 (
    echo ⚠️ Remote might already exist
    git remote set-url origin https://github.com/flexsyyy/RAGify.git
)
echo ✅ GitHub remote configured

echo.
echo ===============================================================================
echo STEP 9: Push Frontend to GitHub
echo ===============================================================================

echo 📤 Pushing frontend-optimizations branch to GitHub...
git push -u origin frontend-optimizations
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to push to GitHub
    echo 💡 You may need to authenticate with GitHub
    echo 💡 Try using GitHub Desktop or personal access token
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo 🎉 FRONTEND COMMIT SUCCESS! 🎉
echo ===============================================================================
echo.
echo ✅ Frontend repository initialized
echo ✅ frontend-optimizations branch created
echo ✅ All optimized frontend code committed
echo ✅ Pushed to GitHub: https://github.com/flexsyyy/RAGify.git
echo.
echo 📋 NEXT STEPS:
echo 1. Go to: https://github.com/flexsyyy/RAGify.git
echo 2. You'll see the 'frontend-optimizations' branch
echo 3. Create a Pull Request to merge with main
echo 4. Review the beautiful React frontend code
echo.
echo 🎨 Your optimized RAGify frontend is now on GitHub!
echo.
echo 📱 Frontend Features Available:
echo - Modern React + Next.js interface
echo - Drag & drop file uploads
echo - Handwriting recognition toggle
echo - Real-time status monitoring
echo - Database reset functionality
echo - Beautiful responsive design
echo.
pause
