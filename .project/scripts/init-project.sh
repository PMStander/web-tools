#!/bin/bash

# Project Management System Initialization Script
# This script helps set up the project management system for new projects

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to prompt for user input
prompt_input() {
    local prompt="$1"
    local default="$2"
    local result
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " result
        result=${result:-$default}
    else
        read -p "$prompt: " result
    fi
    
    echo "$result"
}

# Function to prompt for yes/no
prompt_yes_no() {
    local prompt="$1"
    local default="$2"
    local result
    
    while true; do
        if [ "$default" = "y" ]; then
            read -p "$prompt [Y/n]: " result
            result=${result:-y}
        else
            read -p "$prompt [y/N]: " result
            result=${result:-n}
        fi
        
        case $result in
            [Yy]* ) echo "y"; break;;
            [Nn]* ) echo "n"; break;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Main initialization function
main() {
    print_header "Project Management System Initialization"
    
    echo "This script will help you set up the project management system for your project."
    echo "It will create necessary directories, customize templates, and set up initial configuration."
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "memory-index.md" ] || [ ! -d ".project" ]; then
        print_error "This doesn't appear to be a project management system directory."
        print_error "Please run this script from the root of the project management system."
        exit 1
    fi
    
    # Gather project information
    print_header "Project Information"
    
    PROJECT_NAME=$(prompt_input "Project name" "$(basename $(pwd))")
    PROJECT_DESCRIPTION=$(prompt_input "Project description" "A software development project")
    PROJECT_TYPE=$(prompt_input "Project type (web-app/mobile-app/desktop-app/library/other)" "web-app")
    
    # Technology stack
    print_header "Technology Stack"
    
    FRONTEND_FRAMEWORK=$(prompt_input "Frontend framework (React/Vue/Angular/other)" "")
    BACKEND_FRAMEWORK=$(prompt_input "Backend framework (Node.js/Python/Java/other)" "")
    DATABASE=$(prompt_input "Database (PostgreSQL/MySQL/MongoDB/other)" "")
    
    # Team information
    print_header "Team Information"
    
    TEAM_LEAD=$(prompt_input "Team lead name" "")
    TEAM_SIZE=$(prompt_input "Team size" "1-5")
    
    # Setup options
    print_header "Setup Options"
    
    CREATE_README=$(prompt_yes_no "Create README.md from template?" "y")
    CREATE_CONTRIBUTING=$(prompt_yes_no "Create CONTRIBUTING.md from template?" "y")
    SETUP_MODULES=$(prompt_yes_no "Set up initial modules?" "n")
    
    # Start initialization
    print_header "Initializing Project"
    
    # Update core memory files
    print_status "Updating core memory files..."
    
    # Update project brief
    if [ -f ".project/core/projectbrief.md" ]; then
        sed -i.bak "s/\[Project Name\]/$PROJECT_NAME/g" .project/core/projectbrief.md
        sed -i.bak "s/\[Project Description\]/$PROJECT_DESCRIPTION/g" .project/core/projectbrief.md
        sed -i.bak "s/\[Project Type\]/$PROJECT_TYPE/g" .project/core/projectbrief.md
        rm .project/core/projectbrief.md.bak 2>/dev/null || true
        print_status "Updated project brief"
    fi
    
    # Update tech context
    if [ -f ".project/core/techContext.md" ]; then
        if [ -n "$FRONTEND_FRAMEWORK" ]; then
            sed -i.bak "s/\[Frontend Framework\]/$FRONTEND_FRAMEWORK/g" .project/core/techContext.md
        fi
        if [ -n "$BACKEND_FRAMEWORK" ]; then
            sed -i.bak "s/\[Backend Framework\]/$BACKEND_FRAMEWORK/g" .project/core/techContext.md
        fi
        if [ -n "$DATABASE" ]; then
            sed -i.bak "s/\[Database\]/$DATABASE/g" .project/core/techContext.md
        fi
        rm .project/core/techContext.md.bak 2>/dev/null || true
        print_status "Updated tech context"
    fi
    
    # Update active context
    if [ -f ".project/core/activeContext.md" ]; then
        sed -i.bak "s/\[Project Name\]/$PROJECT_NAME/g" .project/core/activeContext.md
        sed -i.bak "s/Setting up the project management system/Initializing $PROJECT_NAME project/g" .project/core/activeContext.md
        rm .project/core/activeContext.md.bak 2>/dev/null || true
        print_status "Updated active context"
    fi
    
    # Create README if requested
    if [ "$CREATE_README" = "y" ]; then
        if [ -f "templates/README-template.md" ]; then
            cp templates/README-template.md README.md
            sed -i.bak "s/\[Project Name\]/$PROJECT_NAME/g" README.md
            sed -i.bak "s/\[Brief description of what this project does and its main purpose\]/$PROJECT_DESCRIPTION/g" README.md
            rm README.md.bak 2>/dev/null || true
            print_status "Created README.md"
        else
            print_warning "README template not found"
        fi
    fi
    
    # Create CONTRIBUTING if requested
    if [ "$CREATE_CONTRIBUTING" = "y" ]; then
        if [ -f "templates/CONTRIBUTING-template.md" ]; then
            cp templates/CONTRIBUTING-template.md CONTRIBUTING.md
            sed -i.bak "s/\[Project Name\]/$PROJECT_NAME/g" CONTRIBUTING.md
            rm CONTRIBUTING.md.bak 2>/dev/null || true
            print_status "Created CONTRIBUTING.md"
        else
            print_warning "CONTRIBUTING template not found"
        fi
    fi
    
    # Set up modules if requested
    if [ "$SETUP_MODULES" = "y" ]; then
        print_status "Setting up modules directory..."
        mkdir -p modules
        
        while true; do
            MODULE_NAME=$(prompt_input "Module name (or 'done' to finish)" "done")
            if [ "$MODULE_NAME" = "done" ]; then
                break
            fi
            
            if [ -d "templates/module-template" ]; then
                mkdir -p "modules/$MODULE_NAME"
                cp -r templates/module-template/* "modules/$MODULE_NAME/"
                
                # Customize module templates
                for file in "modules/$MODULE_NAME"/*.md; do
                    if [ -f "$file" ]; then
                        sed -i.bak "s/\[Module Name\]/$MODULE_NAME/g" "$file"
                        rm "$file.bak" 2>/dev/null || true
                    fi
                done
                
                print_status "Created module: $MODULE_NAME"
            else
                print_warning "Module template not found"
            fi
        done
    fi
    
    # Create initial task log
    print_status "Creating initial task log..."
    TIMESTAMP=$(date +%Y-%m-%d-%H-%M)
    TASK_LOG_FILE=".project/task-logs/task-log_${TIMESTAMP}_project-initialization.md"
    
    if [ -f "templates/task-log-template.md" ]; then
        cp templates/task-log-template.md "$TASK_LOG_FILE"
        sed -i.bak "s/\[Brief Description\]/Project Initialization/g" "$TASK_LOG_FILE"
        sed -i.bak "s/YYYY-MM-DD/$(date +%Y-%m-%d)/g" "$TASK_LOG_FILE"
        sed -i.bak "s/HH:MM/$(date +%H:%M)/g" "$TASK_LOG_FILE"
        rm "$TASK_LOG_FILE.bak" 2>/dev/null || true
        print_status "Created initial task log: $TASK_LOG_FILE"
    fi
    
    # Update memory index
    print_status "Updating memory index..."
    if [ -f "memory-index.md" ]; then
        sed -i.bak "s/This is a reusable project management system/This is the $PROJECT_NAME project/g" memory-index.md
        rm memory-index.md.bak 2>/dev/null || true
    fi
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
        print_status "Creating .gitignore..."
        cat > .gitignore << EOF
# Project Management System - Optional excludes
# Uncomment lines below if you want to exclude certain files from version control

# Task logs (uncomment if you don't want to track individual task logs)
# .project/task-logs/*.md

# Error logs (uncomment if you don't want to track error logs)
# .project/errors/*.md

# Temporary files
*.tmp
*.bak
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
EOF
    fi
    
    print_header "Initialization Complete!"
    
    echo ""
    print_status "Project '$PROJECT_NAME' has been initialized successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review and customize the files in .project/core/"
    echo "2. Update status/current-focus.md with your immediate goals"
    echo "3. Create your first implementation plan in .project/plans/"
    echo "4. Start documenting your work using the task log templates"
    echo ""
    echo "For more information, see:"
    echo "- SETUP-GUIDE.md for detailed setup instructions"
    echo "- templates/template-index.md for available templates"
    echo "- memory-index.md for system overview"
    echo ""
    print_status "Happy coding!"
}

# Run main function
main "$@"
