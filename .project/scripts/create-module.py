#!/usr/bin/env python3
"""
Module Creation Script for Project Management System
This script helps create new modules with proper documentation structure
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

def create_module_directory_structure(module_dir, module_type):
    """Create module directory structure based on type"""
    base_dirs = ["components", "services", "types", "utils"]
    
    if module_type == "web-frontend":
        dirs = base_dirs + ["pages", "assets", "styles"]
    elif module_type == "web-backend":
        dirs = base_dirs + ["routes", "models", "middleware"]
    elif module_type == "mobile":
        dirs = base_dirs + ["screens", "navigation", "assets"]
    elif module_type == "library":
        dirs = base_dirs + ["lib", "examples", "tests"]
    else:  # generic
        dirs = base_dirs
    
    for dir_name in dirs:
        dir_path = module_dir / dir_name
        dir_path.mkdir(exist_ok=True)
        
        # Create .gitkeep file to ensure directory is tracked
        gitkeep_path = dir_path / ".gitkeep"
        gitkeep_path.touch()

def main():
    """Main module creation function"""
    print_header("Module Creation Tool")
    
    print("This script will help you create a new module with proper documentation structure.")
    print()
    
    # Check if we're in the right directory
    if not os.path.exists(".project/memory-index.md") or not os.path.exists(".project"):
        print_error("This doesn't appear to be a project management system directory.")
        print_error("Please run this script from the root of the project management system.")
        sys.exit(1)

    # Check if module template exists
    module_template_dir = Path(".project/templates/module-template")
    if not module_template_dir.exists():
        print_error("Module template directory not found.")
        print_error("Please ensure .project/templates/module-template/ exists.")
        sys.exit(1)
    
    # Gather module information
    print_header("Module Information")
    
    module_name = prompt_input("Module name")
    if not module_name:
        print_error("Module name is required.")
        sys.exit(1)
    
    module_description = prompt_input("Module description", f"The {module_name} module")
    module_purpose = prompt_input("Module purpose", f"Provides {module_name} functionality")
    
    # Module type
    print()
    print("Module types:")
    print("1. web-frontend - Frontend web module")
    print("2. web-backend - Backend web module")
    print("3. mobile - Mobile app module")
    print("4. library - Library/utility module")
    print("5. generic - Generic module")
    
    module_type_choice = prompt_input("Module type (1-5)", "5")
    module_type_map = {
        "1": "web-frontend",
        "2": "web-backend", 
        "3": "mobile",
        "4": "library",
        "5": "generic"
    }
    module_type = module_type_map.get(module_type_choice, "generic")
    
    # Dependencies
    print_header("Dependencies and Integration")
    
    dependencies = prompt_input("Key dependencies (comma-separated)", "")
    integrations = prompt_input("Integration points (comma-separated)", "")
    
    # Setup options
    print_header("Setup Options")
    
    create_directory_structure = prompt_yes_no("Create module directory structure?", "y")
    create_plan = prompt_yes_no("Create implementation plan?", "y")
    
    # Start creation
    print_header("Creating Module")
    
    # Create module directory
    modules_dir = Path("modules")
    modules_dir.mkdir(exist_ok=True)
    
    module_dir = modules_dir / module_name
    if module_dir.exists():
        overwrite = prompt_yes_no(f"Module '{module_name}' already exists. Overwrite?", "n")
        if not overwrite:
            print_status("Module creation cancelled.")
            return
    
    module_dir.mkdir(exist_ok=True)
    print_status(f"Created module directory: {module_dir}")
    
    # Prepare replacements
    replacements = {
        "[Module Name]": module_name,
        "[Module Description]": module_description,
        "[Module Purpose]": module_purpose,
        "[Module Type]": module_type,
        "[Dependencies]": dependencies,
        "[Integration Points]": integrations,
        "[Date]": datetime.datetime.now().strftime("%Y-%m-%d"),
    }
    
    # Copy and customize template files
    print_status("Creating module documentation...")
    
    for template_file in module_template_dir.glob("*.md"):
        target_file = module_dir / template_file.name
        copy_and_customize_template(template_file, target_file, replacements)
        print_status(f"Created {target_file.name}")
    
    # Create directory structure if requested
    if create_directory_structure:
        print_status("Creating module directory structure...")
        create_module_directory_structure(module_dir, module_type)
        print_status(f"Created {module_type} directory structure")
    
    # Create implementation plan if requested
    if create_plan:
        print_status("Creating implementation plan...")
        plan_file = Path(f".project/plans/{module_name}-implementation-plan.md")
        
        plan_content = f"""# {module_name} Module Implementation Plan

## Overview
Implementation plan for the {module_name} module.

## Module Information
- **Name**: {module_name}
- **Description**: {module_description}
- **Purpose**: {module_purpose}
- **Type**: {module_type}
- **Created**: {datetime.datetime.now().strftime("%Y-%m-%d")}

## Dependencies
{dependencies if dependencies else "None specified"}

## Integration Points
{integrations if integrations else "None specified"}

## Implementation Phases

### Phase 1: Foundation
- [ ] Set up module structure
- [ ] Create core interfaces
- [ ] Implement basic functionality
- [ ] Write initial tests

### Phase 2: Core Features
- [ ] Implement main features
- [ ] Add error handling
- [ ] Enhance test coverage
- [ ] Create documentation

### Phase 3: Integration
- [ ] Integrate with core system
- [ ] Test cross-module interactions
- [ ] Performance optimization
- [ ] Final documentation review

## Success Criteria
- [ ] All planned features implemented
- [ ] Test coverage > 80%
- [ ] Documentation complete
- [ ] Integration tests passing
- [ ] Performance requirements met

## Timeline
- **Phase 1**: [Estimated duration]
- **Phase 2**: [Estimated duration]
- **Phase 3**: [Estimated duration]
- **Total**: [Total estimated duration]

## Resources Required
- [List required resources]

## Risks and Mitigation
- [Identify potential risks and mitigation strategies]

## Notes
[Additional notes and considerations]
"""
        
        with open(plan_file, 'w', encoding='utf-8') as f:
            f.write(plan_content)
        
        print_status(f"Created implementation plan: {plan_file}")
    
    # Create task log for module creation
    print_status("Creating task log...")
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d-%H-%M")
    task_log_file = Path(f".project/task-logs/task-log_{timestamp}_create-{module_name}-module.md")

    task_log_template = Path(".project/templates/task-log-template.md")
    if task_log_template.exists():
        task_log_replacements = {
            "[Brief Description]": f"Create {module_name} Module",
            "YYYY-MM-DD": datetime.datetime.now().strftime("%Y-%m-%d"),
            "HH:MM": datetime.datetime.now().strftime("%H:%M"),
        }
        copy_and_customize_template(task_log_template, task_log_file, task_log_replacements)
        print_status(f"Created task log: {task_log_file}")
    
    # Update active context
    print_status("Updating active context...")
    active_context_path = Path(".project/core/activeContext.md")
    if active_context_path.exists():
        try:
            with open(active_context_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Add module creation to recent activities
            recent_activities_marker = "## Recent Activities"
            if recent_activities_marker in content:
                insertion_point = content.find(recent_activities_marker) + len(recent_activities_marker)
                new_activity = f"\n- Created {module_name} module with documentation and structure"
                content = content[:insertion_point] + new_activity + content[insertion_point:]
                
                with open(active_context_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print_status("Updated active context")
        except Exception as e:
            print_warning(f"Could not update active context: {e}")
    
    print_header("Module Creation Complete!")
    
    print()
    print_status(f"Module '{module_name}' has been created successfully!")
    print()
    print("Created files:")
    print(f"- Module documentation in modules/{module_name}/")
    if create_plan:
        print(f"- Implementation plan in .project/plans/{module_name}-implementation-plan.md")
    print(f"- Task log in {task_log_file}")
    print()
    print("Next steps:")
    print("1. Review and customize the module documentation")
    print("2. Update the implementation plan with specific details")
    print("3. Begin implementing the module following the plan")
    print("4. Update progress in the implementation status document")
    print()
    print_status("Happy coding!")

if __name__ == "__main__":
    main()
