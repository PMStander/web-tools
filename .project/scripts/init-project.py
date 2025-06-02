#!/usr/bin/env python3
"""
Project Management System Initialization Script
This script helps set up the project management system for new projects
"""

import os
import sys
import shutil
import datetime
from pathlib import Path

class Colors:
    """ANSI color codes for terminal output"""
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def print_status(message):
    """Print status message in green"""
    print(f"{Colors.GREEN}[INFO]{Colors.NC} {message}")

def print_warning(message):
    """Print warning message in yellow"""
    print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {message}")

def print_error(message):
    """Print error message in red"""
    print(f"{Colors.RED}[ERROR]{Colors.NC} {message}")

def print_header(message):
    """Print header message in blue"""
    print(f"{Colors.BLUE}=== {message} ==={Colors.NC}")

def prompt_input(prompt, default=None):
    """Prompt for user input with optional default"""
    if default:
        result = input(f"{prompt} [{default}]: ").strip()
        return result if result else default
    else:
        return input(f"{prompt}: ").strip()

def prompt_yes_no(prompt, default="y"):
    """Prompt for yes/no input"""
    while True:
        if default.lower() == "y":
            result = input(f"{prompt} [Y/n]: ").strip().lower()
            result = result if result else "y"
        else:
            result = input(f"{prompt} [y/N]: ").strip().lower()
            result = result if result else "n"
        
        if result in ['y', 'yes']:
            return True
        elif result in ['n', 'no']:
            return False
        else:
            print("Please answer yes or no.")

def replace_in_file(file_path, replacements):
    """Replace text in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        return True
    except Exception as e:
        print_error(f"Error updating {file_path}: {e}")
        return False

def copy_and_customize_template(template_path, target_path, replacements):
    """Copy template file and apply customizations"""
    try:
        shutil.copy2(template_path, target_path)
        replace_in_file(target_path, replacements)
        return True
    except Exception as e:
        print_error(f"Error copying template {template_path}: {e}")
        return False

def main():
    """Main initialization function"""
    print_header("Project Management System Initialization")
    
    print("This script will help you set up the project management system for your project.")
    print("It will create necessary directories, customize templates, and set up initial configuration.")
    print()
    
    # Check if we're in the right directory
    if not os.path.exists(".project/memory-index.md") or not os.path.exists(".project"):
        print_error("This doesn't appear to be a project management system directory.")
        print_error("Please run this script from the root of the project management system.")
        sys.exit(1)
    
    # Gather project information
    print_header("Project Information")
    
    project_name = prompt_input("Project name", os.path.basename(os.getcwd()))
    project_description = prompt_input("Project description", "A software development project")
    project_type = prompt_input("Project type (web-app/mobile-app/desktop-app/library/other)", "web-app")
    
    # Technology stack
    print_header("Technology Stack")
    
    frontend_framework = prompt_input("Frontend framework (React/Vue/Angular/other)", "")
    backend_framework = prompt_input("Backend framework (Node.js/Python/Java/other)", "")
    database = prompt_input("Database (PostgreSQL/MySQL/MongoDB/other)", "")
    
    # Team information
    print_header("Team Information")
    
    team_lead = prompt_input("Team lead name", "")
    team_size = prompt_input("Team size", "1-5")
    
    # Setup options
    print_header("Setup Options")
    
    create_readme = prompt_yes_no("Create README.md from template?", "y")
    create_contributing = prompt_yes_no("Create CONTRIBUTING.md from template?", "y")
    setup_modules = prompt_yes_no("Set up initial modules?", "n")
    
    # Start initialization
    print_header("Initializing Project")
    
    # Prepare replacements
    replacements = {
        "[Project Name]": project_name,
        "[Project Description]": project_description,
        "[Project Type]": project_type,
        "[Frontend Framework]": frontend_framework,
        "[Backend Framework]": backend_framework,
        "[Database]": database,
        "[Team Lead]": team_lead,
        "[Team Size]": team_size,
    }
    
    # Update core memory files
    print_status("Updating core memory files...")
    
    # Update project brief
    project_brief_path = Path(".project/core/projectbrief.md")
    if project_brief_path.exists():
        replace_in_file(project_brief_path, replacements)
        print_status("Updated project brief")
    
    # Update tech context
    tech_context_path = Path(".project/core/techContext.md")
    if tech_context_path.exists():
        replace_in_file(tech_context_path, replacements)
        print_status("Updated tech context")
    
    # Update active context
    active_context_path = Path(".project/core/activeContext.md")
    if active_context_path.exists():
        active_replacements = {
            **replacements,
            "Setting up the project management system": f"Initializing {project_name} project"
        }
        replace_in_file(active_context_path, active_replacements)
        print_status("Updated active context")
    
    # Create README if requested
    if create_readme:
        readme_template = Path(".project/templates/README-template.md")
        if readme_template.exists():
            readme_replacements = {
                **replacements,
                "[Brief description of what this project does and its main purpose]": project_description
            }
            copy_and_customize_template(readme_template, "README.md", readme_replacements)
            print_status("Created README.md")
        else:
            print_warning("README template not found")

    # Create CONTRIBUTING if requested
    if create_contributing:
        contributing_template = Path(".project/templates/CONTRIBUTING-template.md")
        if contributing_template.exists():
            copy_and_customize_template(contributing_template, "CONTRIBUTING.md", replacements)
            print_status("Created CONTRIBUTING.md")
        else:
            print_warning("CONTRIBUTING template not found")
    
    # Set up modules if requested
    if setup_modules:
        print_status("Setting up modules directory...")
        modules_dir = Path("modules")
        modules_dir.mkdir(exist_ok=True)

        while True:
            module_name = prompt_input("Module name (or 'done' to finish)", "done")
            if module_name.lower() == "done":
                break

            module_template_dir = Path(".project/templates/module-template")
            if module_template_dir.exists():
                module_dir = modules_dir / module_name
                module_dir.mkdir(exist_ok=True)

                # Copy all template files
                for template_file in module_template_dir.glob("*.md"):
                    target_file = module_dir / template_file.name
                    module_replacements = {
                        **replacements,
                        "[Module Name]": module_name
                    }
                    copy_and_customize_template(template_file, target_file, module_replacements)

                print_status(f"Created module: {module_name}")
            else:
                print_warning("Module template not found")
    
    # Create initial task log
    print_status("Creating initial task log...")
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d-%H-%M")
    task_log_file = Path(f".project/task-logs/task-log_{timestamp}_project-initialization.md")

    task_log_template = Path(".project/templates/task-log-template.md")
    if task_log_template.exists():
        task_log_replacements = {
            "[Brief Description]": "Project Initialization",
            "YYYY-MM-DD": datetime.datetime.now().strftime("%Y-%m-%d"),
            "HH:MM": datetime.datetime.now().strftime("%H:%M"),
        }
        copy_and_customize_template(task_log_template, task_log_file, task_log_replacements)
        print_status(f"Created initial task log: {task_log_file}")

    # Update memory index
    print_status("Updating memory index...")
    memory_index_path = Path(".project/memory-index.md")
    if memory_index_path.exists():
        memory_replacements = {
            "This is a reusable project management system": f"This is the {project_name} project"
        }
        replace_in_file(memory_index_path, memory_replacements)
    
    # Create .gitignore if it doesn't exist
    gitignore_path = Path(".gitignore")
    if not gitignore_path.exists():
        print_status("Creating .gitignore...")
        gitignore_content = """# Project Management System - Optional excludes
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
"""
        with open(gitignore_path, 'w', encoding='utf-8') as f:
            f.write(gitignore_content)
    
    print_header("Initialization Complete!")
    
    print()
    print_status(f"Project '{project_name}' has been initialized successfully!")
    print()
    print("Next steps:")
    print("1. Review and customize the files in .project/core/")
    print("2. Update status/current-focus.md with your immediate goals")
    print("3. Create your first implementation plan in .project/plans/")
    print("4. Start documenting your work using the task log templates")
    print()
    print("For more information, see:")
    print("- SETUP-GUIDE.md for detailed setup instructions")
    print("- templates/template-index.md for available templates")
    print("- memory-index.md for system overview")
    print()
    print_status("Happy coding!")

if __name__ == "__main__":
    main()
