#!/usr/bin/env python3
"""
System Validation Script for Project Management System
This script validates that all necessary components are present and functional
"""

import os
import sys
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
    print(f"{Colors.GREEN}[PASS]{Colors.NC} {message}")

def print_warning(message):
    """Print warning message in yellow"""
    print(f"{Colors.YELLOW}[WARN]{Colors.NC} {message}")

def print_error(message):
    """Print error message in red"""
    print(f"{Colors.RED}[FAIL]{Colors.NC} {message}")

def print_header(message):
    """Print header message in blue"""
    print(f"{Colors.BLUE}=== {message} ==={Colors.NC}")

def check_file_exists(file_path, description=""):
    """Check if a file exists and return result"""
    path = Path(file_path)
    if path.exists():
        print_status(f"{description or file_path} exists")
        return True
    else:
        print_error(f"{description or file_path} missing")
        return False

def check_directory_exists(dir_path, description=""):
    """Check if a directory exists and return result"""
    path = Path(dir_path)
    if path.exists() and path.is_dir():
        print_status(f"{description or dir_path} directory exists")
        return True
    else:
        print_error(f"{description or dir_path} directory missing")
        return False

def check_file_content(file_path, required_content, description=""):
    """Check if a file contains required content"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        missing_content = []
        for item in required_content:
            if item not in content:
                missing_content.append(item)
        
        if not missing_content:
            print_status(f"{description or file_path} has required content")
            return True
        else:
            print_warning(f"{description or file_path} missing content: {', '.join(missing_content)}")
            return False
    except Exception as e:
        print_error(f"Error reading {file_path}: {e}")
        return False

def validate_memory_bank():
    """Validate memory bank structure and files"""
    print_header("Memory Bank Validation")
    
    results = []
    
    # Check .project directory structure
    results.append(check_directory_exists(".project", "Memory bank root"))
    results.append(check_directory_exists(".project/core", "Core memory"))
    results.append(check_directory_exists(".project/plans", "Plans directory"))
    results.append(check_directory_exists(".project/task-logs", "Task logs directory"))
    results.append(check_directory_exists(".project/errors", "Errors directory"))
    
    # Check core memory files
    core_files = [
        ("projectbrief.md", "Project brief"),
        ("productContext.md", "Product context"),
        ("systemPatterns.md", "System patterns"),
        ("techContext.md", "Tech context"),
        ("activeContext.md", "Active context"),
        ("userStories.md", "User stories"),
        ("acceptanceCriteria.md", "Acceptance criteria"),
        ("progress.md", "Progress tracking")
    ]
    
    for filename, description in core_files:
        results.append(check_file_exists(f".project/core/{filename}", description))
    
    # Check memory index
    results.append(check_file_exists(".project/memory-index.md", "Memory index"))
    
    return all(results)

def validate_templates():
    """Validate template system"""
    print_header("Template System Validation")

    results = []

    # Check templates directory
    results.append(check_directory_exists(".project/templates", "Templates directory"))

    # Check core templates
    core_templates = [
        ("task-log-template.md", "Task log template"),
        ("error-template.md", "Error template"),
        ("README-template.md", "README template"),
        ("CONTRIBUTING-template.md", "Contributing template"),
        ("template-index.md", "Template index")
    ]

    for filename, description in core_templates:
        results.append(check_file_exists(f".project/templates/{filename}", description))

    # Check module template directory
    results.append(check_directory_exists(".project/templates/module-template", "Module template directory"))

    module_templates = [
        ("overview.md", "Module overview template"),
        ("architecture.md", "Module architecture template"),
        ("implementation-status.md", "Module status template"),
        ("integration-guide.md", "Module integration template")
    ]

    for filename, description in module_templates:
        results.append(check_file_exists(f".project/templates/module-template/{filename}", description))

    # Check project docs templates
    results.append(check_directory_exists(".project/templates/project-docs", "Project docs template directory"))

    project_templates = [
        ("project-overview-template.md", "Project overview template"),
        ("architecture-template.md", "Architecture template")
    ]

    for filename, description in project_templates:
        results.append(check_file_exists(f".project/templates/project-docs/{filename}", description))

    return all(results)

def validate_scripts():
    """Validate initialization and utility scripts"""
    print_header("Scripts Validation")

    results = []

    # Check scripts directory
    results.append(check_directory_exists(".project/scripts", "Scripts directory"))

    # Check initialization scripts
    scripts = [
        ("init-project.sh", "Bash initialization script"),
        ("init-project.bat", "Windows initialization script"),
        ("init-project.py", "Python initialization script"),
        ("create-module.py", "Module creation script"),
        ("validate-system.py", "System validation script"),
        ("README.md", "Scripts documentation")
    ]

    for filename, description in scripts:
        results.append(check_file_exists(f".project/scripts/{filename}", description))

    # Check script executability (Unix systems)
    if os.name != 'nt':  # Not Windows
        executable_scripts = ["init-project.sh", "init-project.py", "create-module.py", "validate-system.py"]
        for script in executable_scripts:
            script_path = Path(f".project/scripts/{script}")
            if script_path.exists():
                if os.access(script_path, os.X_OK):
                    print_status(f"{script} is executable")
                    results.append(True)
                else:
                    print_warning(f"{script} is not executable")
                    results.append(False)

    return all(results)

def validate_knowledge_management():
    """Validate knowledge management system"""
    print_header("Knowledge Management Validation")

    results = []

    # Check knowledge directory
    results.append(check_directory_exists(".project/knowledge", "Knowledge directory"))

    # Check knowledge files
    knowledge_files = [
        ("best-practices.md", "Best practices"),
        ("decisions.md", "Decisions template"),
        ("lessons-learned.md", "Lessons learned template")
    ]

    for filename, description in knowledge_files:
        results.append(check_file_exists(f".project/knowledge/{filename}", description))

    return all(results)

def validate_task_management():
    """Validate task management system"""
    print_header("Task Management Validation")

    results = []

    # Check task management directory structure
    results.append(check_directory_exists(".project/tasks", "Tasks directory"))
    results.append(check_directory_exists(".project/tasks/active", "Active tasks directory"))
    results.append(check_directory_exists(".project/tasks/completed", "Completed tasks directory"))
    results.append(check_directory_exists(".project/tasks/backlog", "Backlog tasks directory"))

    # Check task management files
    results.append(check_file_exists(".project/tasks/README.md", "Task management documentation"))
    results.append(check_file_exists(".project/templates/task-template.md", "Task template"))
    results.append(check_file_exists(".project/scripts/manage-tasks.py", "Task management script"))

    return all(results)

def validate_status_tracking():
    """Validate status tracking system"""
    print_header("Status Tracking Validation")

    results = []

    # Check status directory
    results.append(check_directory_exists(".project/status", "Status directory"))

    # Check status files
    status_files = [
        ("current-focus.md", "Current focus template"),
        ("progress-tracker.md", "Progress tracker template"),
        ("roadmap.md", "Roadmap template")
    ]

    for filename, description in status_files:
        results.append(check_file_exists(f".project/status/{filename}", description))

    return all(results)

def validate_core_system():
    """Validate core system files"""
    print_header("Core System Validation")

    results = []

    # Check core system files
    core_files = [
        (".project/rules.md", "System rules"),
        (".project/memory-index.md", "Memory index")
    ]

    for filename, description in core_files:
        results.append(check_file_exists(filename, description))

    # Check for project-specific content that should be removed
    project_specific_indicators = [
        "Partners In Biz",
        "Firebase",
        "Nuxt",
        "Pinia"
    ]

    # Check rules.md for generic content
    if Path(".project/rules.md").exists():
        generic_content = True
        try:
            with open(".project/rules.md", 'r', encoding='utf-8') as f:
                content = f.read()
            for indicator in project_specific_indicators:
                if indicator in content:
                    print_warning(f".project/rules.md contains project-specific reference: {indicator}")
                    generic_content = False
        except Exception as e:
            print_error(f"Error checking .project/rules.md: {e}")
            generic_content = False

        if generic_content:
            print_status(".project/rules.md is project-agnostic")
        results.append(generic_content)

    return all(results)

def validate_documentation():
    """Validate documentation completeness"""
    print_header("Documentation Validation")

    results = []

    # Check for comprehensive documentation
    required_docs = [
        (".project/templates/template-index.md", "Template index"),
        (".project/scripts/README.md", "Scripts documentation"),
        (".project/memory-index.md", "Memory index")
    ]

    for filename, description in required_docs:
        results.append(check_file_exists(filename, description))

    # Check template index content
    if Path(".project/templates/template-index.md").exists():
        required_sections = [
            "Project Setup Templates",
            "Module Development Templates",
            "Task Management Templates",
            "How to Use These Templates"
        ]
        results.append(check_file_content(".project/templates/template-index.md", required_sections, "Template index"))

    return all(results)

def main():
    """Main validation function"""
    print_header("Project Management System Validation")
    print("Validating system completeness and functionality...")
    print()
    
    validation_results = []
    
    # Run all validations
    validation_results.append(validate_memory_bank())
    validation_results.append(validate_templates())
    validation_results.append(validate_scripts())
    validation_results.append(validate_knowledge_management())
    validation_results.append(validate_task_management())
    validation_results.append(validate_status_tracking())
    validation_results.append(validate_core_system())
    validation_results.append(validate_documentation())
    
    # Summary
    print()
    print_header("Validation Summary")
    
    total_validations = len(validation_results)
    passed_validations = sum(validation_results)
    
    if all(validation_results):
        print_status(f"All {total_validations} validation categories passed!")
        print_status("System is complete and ready for use.")
        return 0
    else:
        failed_validations = total_validations - passed_validations
        print_error(f"{failed_validations} of {total_validations} validation categories failed.")
        print_error("System requires attention before use.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
