@echo off
setlocal enabledelayedexpansion

REM Project Management System Initialization Script for Windows
REM This script helps set up the project management system for new projects

echo ===============================================
echo Project Management System Initialization
echo ===============================================
echo.
echo This script will help you set up the project management system for your project.
echo It will create necessary directories, customize templates, and set up initial configuration.
echo.

REM Check if we're in the right directory
if not exist "memory-index.md" (
    echo [ERROR] This doesn't appear to be a project management system directory.
    echo [ERROR] Please run this script from the root of the project management system.
    pause
    exit /b 1
)

if not exist ".project" (
    echo [ERROR] .project directory not found.
    echo [ERROR] Please run this script from the root of the project management system.
    pause
    exit /b 1
)

REM Gather project information
echo === Project Information ===
echo.

set /p PROJECT_NAME="Project name [%CD%]: "
if "%PROJECT_NAME%"=="" (
    for %%I in (.) do set PROJECT_NAME=%%~nxI
)

set /p PROJECT_DESCRIPTION="Project description [A software development project]: "
if "%PROJECT_DESCRIPTION%"=="" set PROJECT_DESCRIPTION=A software development project

set /p PROJECT_TYPE="Project type (web-app/mobile-app/desktop-app/library/other) [web-app]: "
if "%PROJECT_TYPE%"=="" set PROJECT_TYPE=web-app

echo.
echo === Technology Stack ===
echo.

set /p FRONTEND_FRAMEWORK="Frontend framework (React/Vue/Angular/other): "
set /p BACKEND_FRAMEWORK="Backend framework (Node.js/Python/Java/other): "
set /p DATABASE="Database (PostgreSQL/MySQL/MongoDB/other): "

echo.
echo === Team Information ===
echo.

set /p TEAM_LEAD="Team lead name: "
set /p TEAM_SIZE="Team size [1-5]: "
if "%TEAM_SIZE%"=="" set TEAM_SIZE=1-5

echo.
echo === Setup Options ===
echo.

set /p CREATE_README="Create README.md from template? (y/n) [y]: "
if "%CREATE_README%"=="" set CREATE_README=y

set /p CREATE_CONTRIBUTING="Create CONTRIBUTING.md from template? (y/n) [y]: "
if "%CREATE_CONTRIBUTING%"=="" set CREATE_CONTRIBUTING=y

set /p SETUP_MODULES="Set up initial modules? (y/n) [n]: "
if "%SETUP_MODULES%"=="" set SETUP_MODULES=n

echo.
echo === Initializing Project ===
echo.

REM Update core memory files
echo [INFO] Updating core memory files...

REM Update project brief
if exist ".project\core\projectbrief.md" (
    powershell -Command "(Get-Content '.project\core\projectbrief.md') -replace '\[Project Name\]', '%PROJECT_NAME%' | Set-Content '.project\core\projectbrief.md'"
    powershell -Command "(Get-Content '.project\core\projectbrief.md') -replace '\[Project Description\]', '%PROJECT_DESCRIPTION%' | Set-Content '.project\core\projectbrief.md'"
    powershell -Command "(Get-Content '.project\core\projectbrief.md') -replace '\[Project Type\]', '%PROJECT_TYPE%' | Set-Content '.project\core\projectbrief.md'"
    echo [INFO] Updated project brief
)

REM Update tech context
if exist ".project\core\techContext.md" (
    if not "%FRONTEND_FRAMEWORK%"=="" (
        powershell -Command "(Get-Content '.project\core\techContext.md') -replace '\[Frontend Framework\]', '%FRONTEND_FRAMEWORK%' | Set-Content '.project\core\techContext.md'"
    )
    if not "%BACKEND_FRAMEWORK%"=="" (
        powershell -Command "(Get-Content '.project\core\techContext.md') -replace '\[Backend Framework\]', '%BACKEND_FRAMEWORK%' | Set-Content '.project\core\techContext.md'"
    )
    if not "%DATABASE%"=="" (
        powershell -Command "(Get-Content '.project\core\techContext.md') -replace '\[Database\]', '%DATABASE%' | Set-Content '.project\core\techContext.md'"
    )
    echo [INFO] Updated tech context
)

REM Update active context
if exist ".project\core\activeContext.md" (
    powershell -Command "(Get-Content '.project\core\activeContext.md') -replace '\[Project Name\]', '%PROJECT_NAME%' | Set-Content '.project\core\activeContext.md'"
    powershell -Command "(Get-Content '.project\core\activeContext.md') -replace 'Setting up the project management system', 'Initializing %PROJECT_NAME% project' | Set-Content '.project\core\activeContext.md'"
    echo [INFO] Updated active context
)

REM Create README if requested
if /i "%CREATE_README%"=="y" (
    if exist "templates\README-template.md" (
        copy "templates\README-template.md" "README.md" >nul
        powershell -Command "(Get-Content 'README.md') -replace '\[Project Name\]', '%PROJECT_NAME%' | Set-Content 'README.md'"
        powershell -Command "(Get-Content 'README.md') -replace '\[Brief description of what this project does and its main purpose\]', '%PROJECT_DESCRIPTION%' | Set-Content 'README.md'"
        echo [INFO] Created README.md
    ) else (
        echo [WARNING] README template not found
    )
)

REM Create CONTRIBUTING if requested
if /i "%CREATE_CONTRIBUTING%"=="y" (
    if exist "templates\CONTRIBUTING-template.md" (
        copy "templates\CONTRIBUTING-template.md" "CONTRIBUTING.md" >nul
        powershell -Command "(Get-Content 'CONTRIBUTING.md') -replace '\[Project Name\]', '%PROJECT_NAME%' | Set-Content 'CONTRIBUTING.md'"
        echo [INFO] Created CONTRIBUTING.md
    ) else (
        echo [WARNING] CONTRIBUTING template not found
    )
)

REM Set up modules if requested
if /i "%SETUP_MODULES%"=="y" (
    echo [INFO] Setting up modules directory...
    if not exist "modules" mkdir modules
    
    :module_loop
    set /p MODULE_NAME="Module name (or 'done' to finish) [done]: "
    if "%MODULE_NAME%"=="" set MODULE_NAME=done
    if /i "%MODULE_NAME%"=="done" goto module_done
    
    if exist "templates\module-template" (
        if not exist "modules\%MODULE_NAME%" mkdir "modules\%MODULE_NAME%"
        xcopy "templates\module-template\*" "modules\%MODULE_NAME%\" /E /Y >nul
        
        REM Customize module templates
        for %%f in ("modules\%MODULE_NAME%\*.md") do (
            powershell -Command "(Get-Content '%%f') -replace '\[Module Name\]', '%MODULE_NAME%' | Set-Content '%%f'"
        )
        
        echo [INFO] Created module: %MODULE_NAME%
    ) else (
        echo [WARNING] Module template not found
    )
    goto module_loop
    :module_done
)

REM Create initial task log
echo [INFO] Creating initial task log...
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set DATE=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIME=%%a-%%b
set TIMESTAMP=%DATE%-%TIME%
set TASK_LOG_FILE=.project\task-logs\task-log_%TIMESTAMP%_project-initialization.md

if exist "templates\task-log-template.md" (
    copy "templates\task-log-template.md" "%TASK_LOG_FILE%" >nul
    powershell -Command "(Get-Content '%TASK_LOG_FILE%') -replace '\[Brief Description\]', 'Project Initialization' | Set-Content '%TASK_LOG_FILE%'"
    echo [INFO] Created initial task log: %TASK_LOG_FILE%
)

REM Update memory index
echo [INFO] Updating memory index...
if exist "memory-index.md" (
    powershell -Command "(Get-Content 'memory-index.md') -replace 'This is a reusable project management system', 'This is the %PROJECT_NAME% project' | Set-Content 'memory-index.md'"
)

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo [INFO] Creating .gitignore...
    (
        echo # Project Management System - Optional excludes
        echo # Uncomment lines below if you want to exclude certain files from version control
        echo.
        echo # Task logs ^(uncomment if you don't want to track individual task logs^)
        echo # .project/task-logs/*.md
        echo.
        echo # Error logs ^(uncomment if you don't want to track error logs^)
        echo # .project/errors/*.md
        echo.
        echo # Temporary files
        echo *.tmp
        echo *.bak
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # IDE files
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo.
        echo # OS files
        echo .DS_Store
        echo Thumbs.db
    ) > .gitignore
)

echo.
echo ===============================================
echo Initialization Complete!
echo ===============================================
echo.
echo [INFO] Project '%PROJECT_NAME%' has been initialized successfully!
echo.
echo Next steps:
echo 1. Review and customize the files in .project\core\
echo 2. Update status\current-focus.md with your immediate goals
echo 3. Create your first implementation plan in .project\plans\
echo 4. Start documenting your work using the task log templates
echo.
echo For more information, see:
echo - SETUP-GUIDE.md for detailed setup instructions
echo - templates\template-index.md for available templates
echo - memory-index.md for system overview
echo.
echo [INFO] Happy coding!
echo.
pause
