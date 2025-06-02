#!/usr/bin/env python3
"""
Task Management Script for Project Management System
This script helps create, update, and manage tasks in the system
"""

import os
import sys
import datetime
import shutil
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

def prompt_choice(prompt, choices):
    """Prompt for choice from list"""
    print(f"{prompt}")
    for i, choice in enumerate(choices, 1):
        print(f"{i}. {choice}")
    
    while True:
        try:
            choice_num = int(input("Enter choice number: "))
            if 1 <= choice_num <= len(choices):
                return choices[choice_num - 1]
            else:
                print("Invalid choice. Please try again.")
        except ValueError:
            print("Please enter a valid number.")

def generate_task_id():
    """Generate unique task ID"""
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    return f"task-{timestamp}"

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

def create_task():
    """Create a new task"""
    print_header("Create New Task")
    
    # Check if template exists
    template_path = Path(".project/templates/task-template.md")
    if not template_path.exists():
        print_error("Task template not found. Please ensure .project/templates/task-template.md exists.")
        return
    
    # Gather task information
    task_title = prompt_input("Task title")
    if not task_title:
        print_error("Task title is required.")
        return
    
    task_description = prompt_input("Task description", "")
    priority = prompt_choice("Priority", ["High", "Medium", "Low"])
    estimated_time = prompt_input("Estimated time", "TBD")
    assigned_to = prompt_input("Assigned to", "Self")
    due_date = prompt_input("Due date (YYYY-MM-DD or N/A)", "N/A")
    
    # Generate task ID and create file
    task_id = generate_task_id()
    task_filename = f"{task_id}_{task_title.lower().replace(' ', '-').replace('/', '-')}.md"
    task_path = Path(f".project/tasks/active/{task_filename}")
    
    # Copy template and customize
    shutil.copy2(template_path, task_path)
    
    replacements = {
        "[Task Title]": task_title,
        "[Unique task ID - auto-generated]": task_id,
        "[YYYY-MM-DD]": datetime.datetime.now().strftime("%Y-%m-%d"),
        "[High/Medium/Low]": priority,
        "[Time estimate]": estimated_time,
        "[Team member or self]": assigned_to,
        "[Todo/In Progress/Completed]": "Todo",
        "[YYYY-MM-DD or N/A]": due_date,
        "[Detailed description of what needs to be done]": task_description or "Description to be added"
    }
    
    replace_in_file(task_path, replacements)
    
    print_status(f"Created task: {task_filename}")
    print_status(f"Task ID: {task_id}")
    print_status(f"Location: {task_path}")

def list_tasks():
    """List all tasks"""
    print_header("Task Overview")
    
    for status in ["active", "completed", "backlog"]:
        task_dir = Path(f".project/tasks/{status}")
        if task_dir.exists():
            tasks = list(task_dir.glob("*.md"))
            print(f"\n{Colors.BLUE}{status.upper()} ({len(tasks)} tasks):{Colors.NC}")
            
            if tasks:
                for task_file in sorted(tasks):
                    # Extract task title from filename
                    filename = task_file.stem
                    if "_" in filename:
                        task_title = filename.split("_", 1)[1].replace("-", " ").title()
                    else:
                        task_title = filename.replace("-", " ").title()
                    print(f"  - {task_title} ({task_file.name})")
            else:
                print(f"  No {status} tasks")

def move_task():
    """Move task between directories"""
    print_header("Move Task")
    
    # List current tasks
    list_tasks()
    
    # Get task to move
    task_file = prompt_input("Enter task filename (with .md extension)")
    if not task_file.endswith(".md"):
        task_file += ".md"
    
    # Find the task
    task_path = None
    current_status = None
    
    for status in ["active", "completed", "backlog"]:
        potential_path = Path(f".project/tasks/{status}/{task_file}")
        if potential_path.exists():
            task_path = potential_path
            current_status = status
            break
    
    if not task_path:
        print_error(f"Task '{task_file}' not found in any directory.")
        return
    
    # Choose destination
    statuses = ["active", "completed", "backlog"]
    statuses.remove(current_status)
    
    new_status = prompt_choice(f"Move from '{current_status}' to", statuses)
    new_path = Path(f".project/tasks/{new_status}/{task_file}")
    
    # Move the file
    shutil.move(task_path, new_path)
    
    # Update task status in file if moving to completed
    if new_status == "completed":
        replacements = {
            "**Status**: Todo": "**Status**: Completed",
            "**Status**: In Progress": "**Status**: Completed",
            "**Completed Date**: [YYYY-MM-DD]": f"**Completed Date**: {datetime.datetime.now().strftime('%Y-%m-%d')}"
        }
        replace_in_file(new_path, replacements)
    
    print_status(f"Moved task from '{current_status}' to '{new_status}'")

def main():
    """Main task management function"""
    print_header("Task Management System")
    
    # Check if we're in the right directory
    if not os.path.exists(".project/tasks"):
        print_error("Task management directories not found.")
        print_error("Please run this script from the project root with .project/tasks/ structure.")
        sys.exit(1)
    
    while True:
        print("\nAvailable actions:")
        print("1. Create new task")
        print("2. List all tasks")
        print("3. Move task")
        print("4. Exit")
        
        choice = prompt_input("Choose action (1-4)", "4")
        
        if choice == "1":
            create_task()
        elif choice == "2":
            list_tasks()
        elif choice == "3":
            move_task()
        elif choice == "4":
            print_status("Goodbye!")
            break
        else:
            print_warning("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
