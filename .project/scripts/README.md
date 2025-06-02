# Project Management System Scripts

This directory contains initialization and utility scripts for the project management system.

## Available Scripts

### Project Initialization Scripts

#### `init-project.sh` (Linux/macOS)
Bash script for initializing the project management system on Unix-like systems.

**Usage:**
```bash
./scripts/init-project.sh
```

**Features:**
- Interactive project setup
- Core memory file customization
- Template-based file creation
- Module setup (optional)
- Colored terminal output
- Error handling and validation

#### `init-project.bat` (Windows)
Batch script for initializing the project management system on Windows.

**Usage:**
```cmd
scripts\init-project.bat
```

**Features:**
- Interactive project setup
- Core memory file customization
- Template-based file creation
- Module setup (optional)
- Windows-compatible file operations

#### `init-project.py` (Cross-platform)
Python script for initializing the project management system on any platform with Python 3.

**Usage:**
```bash
python scripts/init-project.py
# or
python3 scripts/init-project.py
```

**Requirements:**
- Python 3.6 or higher
- No additional dependencies required

**Features:**
- Cross-platform compatibility
- Interactive project setup
- Core memory file customization
- Template-based file creation
- Module setup (optional)
- Colored terminal output
- Robust error handling

### Module Creation Scripts

#### `create-module.py` (Cross-platform)
Python script for creating new modules with proper documentation structure.

**Usage:**
```bash
python scripts/create-module.py
# or
python3 scripts/create-module.py
```

**Features:**
- Interactive module creation
- Multiple module types (web-frontend, web-backend, mobile, library, generic)
- Automatic directory structure creation
- Documentation template customization
- Implementation plan generation
- Task log creation
- Active context updates

## Script Features

### Common Features
All scripts provide:
- **Interactive Setup**: Guided prompts for configuration
- **Template Customization**: Automatic replacement of placeholders
- **Validation**: Checks for required files and directories
- **Error Handling**: Graceful error handling with informative messages
- **Documentation Generation**: Creates initial documentation files

### Platform Compatibility

| Script | Linux | macOS | Windows | Requirements |
|--------|-------|-------|---------|--------------|
| `init-project.sh` | ✅ | ✅ | ❌ | Bash shell |
| `init-project.bat` | ❌ | ❌ | ✅ | Windows Command Prompt |
| `init-project.py` | ✅ | ✅ | ✅ | Python 3.6+ |
| `create-module.py` | ✅ | ✅ | ✅ | Python 3.6+ |

## Usage Examples

### Quick Project Setup
```bash
# Clone or copy the project management system
git clone [repository-url] my-new-project
cd my-new-project

# Run initialization script
python scripts/init-project.py

# Follow the interactive prompts
```

### Creating a New Module
```bash
# From your project root directory
python scripts/create-module.py

# Follow the prompts to create your module
```

## Script Workflow

### Project Initialization Workflow
1. **Validation**: Check for required files and directories
2. **Information Gathering**: Collect project details through interactive prompts
3. **Core File Updates**: Customize memory bank files with project information
4. **Template Processing**: Create README, CONTRIBUTING, and other files from templates
5. **Module Setup**: Optionally create initial modules
6. **Task Logging**: Create initial task log
7. **Final Setup**: Update memory index and create .gitignore

### Module Creation Workflow
1. **Validation**: Ensure we're in a valid project directory
2. **Module Information**: Collect module details and configuration
3. **Directory Creation**: Create module directory structure
4. **Documentation**: Generate module documentation from templates
5. **Planning**: Create implementation plan (optional)
6. **Integration**: Update project documentation and active context

## Customization

### Adding New Scripts
To add new scripts to the system:

1. Create the script file in the `scripts/` directory
2. Make it executable (Unix systems): `chmod +x scripts/your-script.sh`
3. Add documentation to this README
4. Update the template index if the script creates new templates

### Modifying Existing Scripts
When modifying scripts:

1. Test on all target platforms
2. Update documentation
3. Maintain backward compatibility when possible
4. Follow the existing error handling patterns

### Script Templates
Scripts use the same template system as the rest of the project management system. Template placeholders include:

- `[Project Name]`: Project name
- `[Project Description]`: Project description
- `[Module Name]`: Module name
- `[Date]`: Current date
- `[Frontend Framework]`: Frontend technology
- `[Backend Framework]`: Backend technology
- `[Database]`: Database technology

## Troubleshooting

### Common Issues

#### Permission Denied (Unix systems)
```bash
chmod +x scripts/init-project.sh
chmod +x scripts/init-project.py
chmod +x scripts/create-module.py
```

#### Python Not Found
Ensure Python 3.6+ is installed:
```bash
python --version
# or
python3 --version
```

#### Script Not Found
Ensure you're running the script from the project root directory:
```bash
pwd  # Should show your project root
ls scripts/  # Should show the script files
```

#### Template Files Missing
Ensure the templates directory exists and contains the required templates:
```bash
ls templates/
ls templates/module-template/
```

### Error Messages

#### "This doesn't appear to be a project management system directory"
- **Cause**: Script is not being run from the correct directory
- **Solution**: Navigate to the project root directory where `memory-index.md` and `.project/` exist

#### "Template not found"
- **Cause**: Required template files are missing
- **Solution**: Ensure all template files exist in the `templates/` directory

#### "Module already exists"
- **Cause**: Attempting to create a module that already exists
- **Solution**: Choose a different module name or confirm overwrite when prompted

## Advanced Usage

### Batch Operations
For setting up multiple projects or modules, you can create wrapper scripts that call these scripts with predefined parameters.

### CI/CD Integration
These scripts can be integrated into CI/CD pipelines for automated project setup and validation.

### Custom Templates
Modify the templates in the `templates/` directory to customize the output of these scripts for your organization's standards.

## Contributing

When contributing to these scripts:

1. Test on all supported platforms
2. Follow the existing code style and patterns
3. Add appropriate error handling
4. Update documentation
5. Consider backward compatibility

## Support

For issues with these scripts:

1. Check the troubleshooting section above
2. Ensure you're using supported Python/shell versions
3. Verify all required files and directories exist
4. Check file permissions on Unix systems

---

For more information about the project management system, see the main documentation in the project root.
